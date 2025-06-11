import { Request, Response } from "express";
import { User } from "../models/users.model";
import { Organization } from "../models/organisations.model";
import { Repository } from "../models/repositories.model";
import { successResponse, errorResponse } from "../utils/responseHendler";

export const getUserInfoController = async (req: Request, res: Response) => {
  const githubId = (req as any).githubId;

  try {
    const user = await User.findOne({ githubId });
    if (!user) return errorResponse(res, "User not found", 404);

    // Get all organizations where the user is a member
    const organizations = await Organization.find({ users: user._id });
    if (!organizations.length)
      return errorResponse(res, "No organizations found", 404);

    const orgData = [];

    for (const org of organizations) {
      const repositories = await Repository.find({ organization: org._id });

      const enrichedRepos = repositories.map((repo) => ({
        _id: repo._id,
        name: repo.name,
        private: repo.private,
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
