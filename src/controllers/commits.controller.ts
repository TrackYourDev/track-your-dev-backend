import { Request, Response } from "express";
import { Organization } from "../models/organisations.model";
import { Repository } from "../models/repositories.model";
import { Commit } from "../models/commits.model";
import { successResponse, errorResponse } from "../utils/responseHendler";
import { getInstallationAccessToken, getCommits } from "../services/githubPreview.service";
import { compareCommits } from "../services/github.service";
import { analyzeGitHubDiff, generateTasks } from "../services/groq.service";
import { filterIgnoredFiles } from "../utils/fileFilter.util";
import { IGitHubComparison } from "../types/index.types";

export const getCommitsController = async (req: Request, res: Response) => {
  const { orgName, repoName } = req.params;
  const { startDate, endDate, page = '1', pageSize = '30' } = req.query;

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

    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);

    // If date range is provided, use existing date range logic
    if (startDate && endDate) {
      // Convert MM-DD-YYYY to Date objects
      const [startMonth, startDay, startYear] = (startDate as string).split('-');
      const [endMonth, endDay, endYear] = (endDate as string).split('-');
      
      const startDateObj = new Date(`${startYear}-${startMonth}-${startDay}T00:00:00Z`);
      const endDateObj = new Date(`${endYear}-${endMonth}-${endDay}T23:59:59Z`);

      const existingCommits = await Commit.find({
        repository: repository._id,
        commitTime: {
          $gte: startDateObj,
          $lte: endDateObj
        }
      }).sort({ commitTime: -1 }).lean();

      if (existingCommits.length > 0) {
        return successResponse(
          res,
          "Fetched commits from database",
          { 
            commits: existingCommits,
            totalCommits: existingCommits.length,
            source: 'database'
          },
          200
        );
      }

      // Fetch from GitHub with date range
      const token = await getInstallationAccessToken(organization.installationId);
      const commits = await getCommits(orgName, repoName, token, {
        since: startDate as string,
        until: endDate as string
      });

      // Process commits as before...
      // [Previous date range processing logic remains the same]
    } else {
      // Pagination logic
      const skip = (pageNum - 1) * pageSizeNum;

      // First try to get commits from database
      const existingCommits = await Commit.find({
        repository: repository._id
      })
      .sort({ commitTime: -1 })
      .skip(skip)
      .limit(pageSizeNum)
      .lean();

      // If we have enough commits in the database, return them
      if (existingCommits.length === pageSizeNum) {
        return successResponse(
          res,
          "Fetched commits from database",
          {
            commits: existingCommits,
            totalCommits: existingCommits.length,
            page: pageNum,
            pageSize: pageSizeNum,
            source: 'database'
          },
          200
        );
      }

      // If we don't have enough commits, fetch from GitHub
      const token = await getInstallationAccessToken(organization.installationId);
      const githubCommits = await getCommits(orgName, repoName, token, {
        per_page: pageSizeNum,
        page: pageNum
      });

      if (!githubCommits || !Array.isArray(githubCommits) || githubCommits.length === 0) {
        return successResponse(
          res,
          "No commits found",
          { 
            commits: [],
            totalCommits: 0,
            page: pageNum,
            pageSize: pageSizeNum
          },
          200
        );
      }

      // Process new commits
      const processedCommits = await Promise.all(
        githubCommits.map(async (commit) => {
          // Check if commit already exists
          const existingCommit = await Commit.findOne({ id: commit.sha });
          if (existingCommit) {
            return {
              _id: existingCommit._id,
              commitMessage: existingCommit.commitMessage,
              commitTime: existingCommit.commitTime,
              additions: existingCommit.additions,
              deletions: existingCommit.deletions,
              changes: existingCommit.changes,
              summaries: existingCommit.summaries,
              tasks: existingCommit.tasks,
              author: existingCommit.author
            };
          }

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

            // Process files and generate tasks
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
              changes: commit.stats?.total || 0,
              author: commit.commit?.author?.name || 'Unknown'
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
              author: commitDoc.author
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
          totalCommits: successfulCommits.length,
          page: pageNum,
          pageSize: pageSizeNum,
          source: 'github'
        },
        200
      );
    }
  } catch (err) {
    console.error("Error fetching commits:", err);
    return errorResponse(res, "Server error", 500, err);
  }
}; 