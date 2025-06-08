import { Request, Response } from "express";
import { User } from "../models/users.model";
import { Organization } from "../models/organisations.model";
import { Repository } from "../models/repositories.model";
import { Commit } from "../models/commits.model";
import { successResponse, errorResponse } from "../utils/responseHendler"; // Adjust the path as needed

export const getUserInfoController = async (req: Request, res: Response) => {
  const githubId = (req as any).githubId;

  try {
    const user = await User.findOne({ githubId });
    if (!user) return errorResponse(res, "User not found", 404);

    // Get all organizations where the user is a member
    const organizations = await Organization.find({ users: user._id });
    if (!organizations.length)
       errorResponse(res, "No organizations found", 404);

    const orgData = [];

    for (const org of organizations) {
      const repositories = await Repository.find({ organization: org._id });

      const repoIds = repositories.map((repo) => repo._id);
      const commits = await Commit.find({ repository: { $in: repoIds } });

      // Group commits by repository ID
      const commitsByRepo: Record<string, any[]> = {};
      commits.forEach((commit) => {
        const repoId = commit.repository.toString();
        if (!commitsByRepo[repoId]) commitsByRepo[repoId] = [];

        commitsByRepo[repoId].push({
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
        });
      });

      const enrichedRepos = repositories.map((repo) => ({
        _id: repo._id,
        name: repo.name,
        private: repo.private,
        commits: commitsByRepo[repo._id.toString()] || [],
      }));

      orgData.push({
        _id: org._id,
        name: org.name,
        avatarUrl: org.avatarUrl,
        description: org.description,
        repositories: enrichedRepos,
      });
    }

    successResponse(
      res,
      "Fetched user Information successfully",
      { organizations: orgData },
      200
    );
  } catch (err) {
    console.error("Error fetching user Information:", err);
    errorResponse(res, "Server error", 500, err);
  }
};
