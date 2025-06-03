import { Request, Response } from "express";
import { PushEvent } from "../models/pushEvent.model";
import { User } from "../models/users.model";
import { Repository } from "../models/repositories.model";
import { successResponse,errorResponse } from "../utils/responseHendler";
import {ICommit, GitHubWebhookPayload, IGitHubComparison} from "../types/index.types";
import jwtToken from "../utils/generateJWT";

export const handleGitHubWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const payload = req.body as GitHubWebhookPayload;
    console.log("Received GitHub webhook payload:", JSON.stringify(payload, null, 2));

    const installationId = payload.installation.id;

    const response = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        Accept: 'application/vnd.github+json'
      }
    });

    const data = await response.json() as { token: string };
    const installationAccessToken = data.token;
    console.log("Installation access token:", installationAccessToken);

    const beforeCommitHash = payload.before;
    const afterCommitHash = payload.after;

    const res = await fetch(`https://api.github.com/repos/${payload.organization.login}/${payload.repository.name}/compare/${beforeCommitHash}...${afterCommitHash}`, {
      headers: {
        Authorization: `token ${installationAccessToken}`,
        Accept: 'application/vnd.github+json'
      }
    });
    
    const comparisonData = await res.json() as IGitHubComparison;
    console.log(comparisonData);
    // console.log(comparisonData.files.map((file: {
    //   filename: string;
    //   additions: number;
    //   deletions: number;
    // }) => ({
    //   file: file.filename,
    //   additions: file.additions,
    //   deletions: file.deletions
    // })));

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
      head_commit,
      organization,
      pushed_at,
    } = payload;
    interface CommitFileChange {
      filePath: string;
      changeType: "added" | "removed" | "modified";
    }
    // 1. Upsert Repository
    const repoData = {
      repoId: repository.id,
      name: repository.name,
      fullName: repository.full_name,
      private: repository.private,
      owner: repository.owner.id, // Link to the user who owns the repo
      defaultBranch: repository.default_branch,
      organization: organization
        ? {
            orgId: organization.id,
            login: organization.login,
            avatarUrl: organization.avatar_url,
            url: organization.url,
            reposUrl: organization.repos_url,
            description: organization.description,
          }
        : undefined,
      createdAt: new Date(repository.created_at),
      updatedAt: new Date(repository.updated_at),
    };

    const repoDoc = await Repository.findOneAndUpdate({ repoId: repository.id }, repoData, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });

    // 2. Upsert User
    const userData = {
      githubId: sender.id, // GitHub user ID
      login: sender.login, // GitHub username
      name: pusher.name || sender.login, // Prefer pusher name if available
      email: pusher.email || null,
      avatarUrl: sender.avatar_url,
      profileUrl: sender.html_url,
    };

    const userDoc = await User.findOneAndUpdate(
      { githubId: sender.id }, // Match using GitHub user ID (more reliable than login)
      userData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 3. Store each Commit

    const pushEvent = {
      repository: repoDoc._id,
      pusher: userDoc._id,
      beforeSha: before,
      afterSha: after,
      created: created,
      deleted: deleted,
      forced: forced,
      compareUrl: compare,
      pushedAt: pushed_at ? new Date(pushed_at) : new Date(),
      commits: commits.map(
        (commit: any): ICommit => ({
          sha: commit.id,
          message: commit.message,
          author: {
            name: commit.author.name,
            email: commit.author.email,
            username: commit.author.username,
          },
          committer: {
            name: commit.committer.name,
            email: commit.committer.email,
            username: commit.committer.username,
          },
          timestamp: new Date(commit.timestamp),
          treeId: commit.tree_id,
          distinct: commit.distinct,
          fileChanges: [
            ...commit.added.map(
              (file: string): CommitFileChange => ({
                filePath: file,
                changeType: "added",
              })
            ),
            ...commit.removed.map(
              (file: string): CommitFileChange => ({
                filePath: file,
                changeType: "removed",
              })
            ),
            ...commit.modified.map(
              (file: string): CommitFileChange => ({
                filePath: file,
                changeType: "modified",
              })
            ),
          ],
        })
      ),
    };

    await PushEvent.insertMany([pushEvent]);

    return successResponse(res, "Commits saved successfully", null, 201);
  } catch (error) {
    console.error("Error saving webhook data:", error);
    return errorResponse(res, "Failed to process GitHub webhook", 500, error);
  }
};
