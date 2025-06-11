import { Request, Response } from "express";
import { Organization } from "../models/organisations.model";
import { Repository } from "../models/repositories.model";
import { Commit } from "../models/commits.model";
import { successResponse, errorResponse } from "../utils/responseHendler";
import { getInstallationAccessToken, getCommits } from "../services/githubPreview.service";
import { compareCommits } from "../services/github.service";
import { analyzeGitHubDiff, generateTasks } from "../services/openai.service";
import { filterIgnoredFiles } from "../utils/fileFilter.util";
import { IGitHubComparison } from "../types/index.types";

export const getCommitsController = async (req: Request, res: Response) => {
  const { orgName, repoName } = req.params;
  const { startDate, endDate } = req.query;
  const githubId = (req as any).githubId;

  try {
    // Find the organization
    const organization = await Organization.findOne({ name: orgName });
    if (!organization) {
      return errorResponse(res, "Organization not found", 404);
    }

    // Find the repository
    const repository = await Repository.findOne({
      organization: organization._id,
      name: repoName,
    });
    if (!repository) {
      return errorResponse(res, "Repository not found", 404);
    }

    // Check if we already have commits for this date range
    const existingCommits = await Commit.find({
      repository: repository._id,
      commitTime: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      }
    });

    // If we have all commits for this date range, return them
    if (existingCommits.length > 0) {
      const formattedCommits = existingCommits.map((commit) => ({
        _id: commit._id,
        commitMessage: commit.commitMessage,
        commitTime: commit.commitTime,
        additions: commit.additions,
        deletions: commit.deletions,
        changes: commit.changes,
        summaries: commit.summaries,
        tasks: commit.tasks,
      }));

      return successResponse(
        res,
        "Fetched commits from database",
        { commits: formattedCommits },
        200
      );
    }

    // If we don't have commits, fetch and process them
    const token = await getInstallationAccessToken(organization.installationId);
    const commits = await getCommits(orgName, repoName, token);

    // Handle case where commits is null or empty
    if (!commits || !Array.isArray(commits) || commits.length === 0) {
      return successResponse(
        res,
        "No commits found for this repository",
        { commits: [] },
        200
      );
    }

    console.log('Total commits fetched from GitHub:', commits.length);
    console.log('Date range:', { startDate, endDate });

    // Filter commits by date range
    const filteredCommits = commits.filter(commit => {
      const commitDate = new Date(commit.commit?.author?.date || '');
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      // Set time to start of day for start date and end of day for end date
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      
      const isInRange = commitDate >= start && commitDate <= end;
      
      if (isInRange) {
        console.log('Found commit in range:', {
          sha: commit.sha,
          date: commitDate,
          message: commit.commit?.message
        });
      }
      
      return isInRange;
    });

    console.log('Filtered commits count:', filteredCommits.length);

    // Process each commit
    const processedCommits = await Promise.all(
      filteredCommits.map(async (commit) => {
        try {
          // Get commit diff
          const comparisonData = await compareCommits(
            orgName,
            repoName,
            commit.parents?.[0]?.sha || '',
            commit.sha,
            organization.installationId
          );

          // Filter out ignored files
          const relevantFiles = filterIgnoredFiles(comparisonData.files);

          // Analyze each file
          const fileAnalyses = await Promise.all(
            relevantFiles.map(async (file: IGitHubComparison['files'][0]) => {
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

          // Generate tasks
          const tasks = await generateTasks(
            fileAnalyses.map((file) => file.summary).join("\n")
          );

          // Create commit document
          const commitDoc = await Commit.create({
            id: commit.sha,
            commitTime: new Date(commit.commit?.author?.date || ''),
            repository: repository._id,
            organization: organization._id,
            summaries: fileAnalyses.map(file => ({
              filename: file.filename,
              summary: file.summary
            })),
            tasks: tasks,
            commitMessage: commit.commit?.message || '',
            additions: commit.stats?.additions || 0,
            deletions: commit.stats?.deletions || 0,
            changes: commit.stats?.total || 0
          });

          return {
            _id: commitDoc._id,
            commitMessage: commitDoc.commitMessage,
            commitTime: commitDoc.commitTime,
            additions: commitDoc.additions,
            deletions: commitDoc.deletions,
            changes: commitDoc.changes,
            summaries: commitDoc.summaries,
            tasks: commitDoc.tasks,
          };
        } catch (error) {
          console.error(`Error processing commit ${commit.sha}:`, error);
          return null;
        }
      })
    );

    // Filter out any failed commits
    const successfulCommits = processedCommits.filter(commit => commit !== null);

    return successResponse(
      res,
      "Fetched and processed commits",
      { 
        commits: successfulCommits,
        totalCommits: filteredCommits.length,
        processedCommits: successfulCommits.length
      },
      200
    );
  } catch (err) {
    console.error("Error fetching commits:", err);
    return errorResponse(res, "Server error", 500, err);
  }
}; 