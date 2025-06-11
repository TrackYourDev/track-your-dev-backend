import { Request, Response } from "express";
import { Organization } from "../models/organisations.model";
import { Repository } from "../models/repositories.model";
import { Commit } from "../models/commits.model";
import { successResponse, errorResponse } from "../utils/responseHendler";

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

    // Build date filter if dates are provided
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.commitTime = {};
      if (startDate) dateFilter.commitTime.$gte = new Date(startDate as string);
      if (endDate) dateFilter.commitTime.$lte = new Date(endDate as string);
    }

    // Find commits with date filter
    const commits = await Commit.find({
      repository: repository._id,
      ...dateFilter,
    }).sort({ commitTime: -1 });

    const formattedCommits = commits.map((commit) => ({
      _id: commit._id,
      commitMessage: commit.commitMessage,
      commitTime: commit.commitTime,
      additions: commit.additions,
      deletions: commit.deletions,
      changes: commit.changes,
      summaries: commit.summaries.map((summary) => ({
        filename: summary.filename,
        summary: summary.summary,
      })),
      tasks: {
        technicalTasks: commit.tasks.technicalTasks.map((task) => ({
          title: task.title,
          description: task.description,
        })),
        nonTechnicalTasks: commit.tasks.nonTechnicalTasks.map((task) => ({
          title: task.title,
          description: task.description,
        })),
      },
    }));

    successResponse(
      res,
      "Fetched commits successfully",
      { commits: formattedCommits },
      200
    );
  } catch (err) {
    console.error("Error fetching commits:", err);
    errorResponse(res, "Server error", 500, err);
  }
}; 