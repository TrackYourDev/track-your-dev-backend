import { Request, Response } from "express";
import { PushEvent } from "../models/pushEvent.model";
import { User } from "../models/users.model";
import { Repository } from "../models/repositories.model";
import { Commit } from "../models/commits.model";
import { Organization } from "../models/organisations.model";
import { successResponse, errorResponse } from "../utils/responseHendler";
import { GitHubWebhookPayload } from "../types/index.types";
import { compareCommits } from "../services/github.service";
import { analyzeGitHubDiff, generateTasks } from "../services/openai.service";
import { filterIgnoredFiles } from "../utils/fileFilter.util";

export async function handleGitHubWebhook(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const payload = req.body as GitHubWebhookPayload;
    console.log("Received GitHub webhook payload:", JSON.stringify(payload, null, 2));

    const installationId = payload.installation.id;
    const beforeCommitHash = payload.before;
    const afterCommitHash = payload.after;

    const comparisonData = await compareCommits(
      payload.organization.login,
      payload.repository.name,
      beforeCommitHash,
      afterCommitHash,
      installationId
    );
    
    console.log(comparisonData);

    // Filter out ignored files before analysis
    const relevantFiles = filterIgnoredFiles(comparisonData.files);
    console.log(`Filtered out ${comparisonData.files.length - relevantFiles.length} ignored files`);

    const fileAnalyses = await Promise.all(
      relevantFiles.map(async (file) => {
        const diff = `
        filename: ${file.filename}
        status: ${file.status} 
        ${file.patch}
        `;
        const analysis = await analyzeGitHubDiff(diff);
        return {
          filename: file.filename,
          ...analysis
        };
      })
    );
    console.log(fileAnalyses);

    const tasks = await generateTasks(fileAnalyses.map((file) => file.summary).join("\n"));
    console.log(tasks);

    const {
      repository,
      pusher,
      sender,
      before,
      after,
      created,
      deleted,
      forced,
      compare,
      commits,
      organization,
      pushed_at,
    } = payload;

    // 1. Upsert User first since other documents will reference it
    const userData = {
      githubId: sender.id,
      login: sender.login,
      name: pusher.name || sender.login,
      email: pusher.email || null,
      avatarUrl: sender.avatar_url,
      profileUrl: sender.html_url,
    };

    const userDoc = await User.findOneAndUpdate(
      { githubId: sender.id },
      userData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 2. Upsert Organization
    const orgData = {
      orgId: organization.id,
      name: organization.login,
      avatarUrl: organization.avatar_url,
      url: organization.url,
      reposUrl: organization.repos_url,
      description: organization.description,
      owner: userDoc._id, // Use the MongoDB _id from the user document
    };

    const orgDoc = await Organization.findOneAndUpdate(
      { orgId: organization.id },
      orgData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 3. Upsert Repository
    const repoData = {
      repoId: repository.id,
      name: repository.name,
      fullName: repository.full_name,
      private: repository.private,
      owner: userDoc._id, // Use the MongoDB _id from the user document
      defaultBranch: repository.default_branch,
      organization: orgDoc._id, // Use the MongoDB _id from the org document
      createdAt: new Date(repository.created_at),
      updatedAt: new Date(repository.updated_at),
    };

    const repoDoc = await Repository.findOneAndUpdate(
      { repoId: repository.id },
      repoData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Update organization's repositories array
    await Organization.findByIdAndUpdate(
      orgDoc._id,
      { $addToSet: { repositories: repoDoc._id } }
    );

    // 4. Store Commits and collect their IDs
    const commitIds = await Promise.all(
      commits.map(async (commit: any) => {
        // Find files changed in this specific commit
        const commitFiles = fileAnalyses.filter(file => 
          commit.added.includes(file.filename) || 
          commit.modified.includes(file.filename) || 
          commit.removed.includes(file.filename)
        );

        // Create commit document
        const commitDoc = await Commit.findOneAndUpdate(
          { id: commit.id },
          {
            id: commit.id,
            commitTime: new Date(commit.timestamp),
            repository: repoDoc._id, // Use the MongoDB _id from the repo document
            organization: orgDoc._id, // Use the MongoDB _id from the org document
            summaries: commitFiles.map(file => ({
              filename: file.filename,
              summary: file.summary
            })),
            tasks: tasks,
            commitMessage: commit.message,
            additions: commit.additions || 0,
            deletions: commit.deletions || 0,
            changes: commit.changes || 0
          },
          { upsert: true, new: true }
        );

        return commitDoc._id;
      })
    );

    // 5. Create PushEvent with all references
    const pushEvent = {
      repository: repoDoc._id, // Use the MongoDB _id from the repo document
      organization: orgDoc._id, // Use the MongoDB _id from the org document
      pusher: userDoc._id, // Use the MongoDB _id from the user document
      beforeSha: before,
      afterSha: after,
      created: created,
      deleted: deleted,
      forced: forced,
      compareUrl: compare,
      pushedAt: pushed_at ? new Date(pushed_at) : new Date(),
      commits: commitIds
    };

    await PushEvent.create(pushEvent);

    return successResponse(res, "Push event and related data saved successfully", null, 201);
  } catch (error) {
    console.error("Error saving webhook data:", error);
    return errorResponse(res, "Failed to process GitHub webhook", 500, error);
  }
}
