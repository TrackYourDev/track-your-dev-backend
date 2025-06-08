import { Request, Response } from "express";
import {User} from "../models/users.model";
import {Organization} from "../models/organisations.model";
import {Repository} from "../models/repositories.model";
import {Commit} from "../models/commits.model";

export const getUserCommits = async (req: Request, res: Response) => {
  const githubId = (req as any).githubId;

  try {
    const user = await User.findOne({ githubId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const organization = await Organization.findOne({ users: user._id });
    if (!organization) return res.status(404).json({ message: "Organization not found" });

    const repositories = await Repository.find({ organization: organization._id });
    const repoIds = repositories.map(repo => repo._id);

    const commits = await Commit.find({ repository: { $in: repoIds } });

    res.status(200).json({ commits });
  } catch (err) {
    console.error("Error fetching commits:", err);
    res.status(500).json({ message: "Server error" });
  }
};
