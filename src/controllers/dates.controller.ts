import { Request, Response } from "express";
import { Organization } from "../models/organisations.model";
import { Repository } from "../models/repositories.model";
import { Commit } from "../models/commits.model";
import { successResponse, errorResponse } from "../utils/responseHendler";
import { getInstallationAccessToken, getCommits } from "../services/githubPreview.service";

export const getDatesToProcess = async (req: Request, res: Response) => {
  try {
    const { orgName } = req.params;
    
    // Find the organization
    const organization = await Organization.findOne({ name: orgName });
    if (!organization) {
      return errorResponse(res, "Organization not found", 404);
    }

    // Get all repositories for this organization
    const repositories = await Repository.find({ organization: organization._id });
    
    // Get all commit dates from our database for these repositories
    const existingCommits = await Commit.find({
      repository: { $in: repositories.map(repo => repo._id) }
    }).select('commitTime');
    
    const existingDates = new Set(
      existingCommits.map(commit => 
        new Date(commit.commitTime).toISOString().split('T')[0]
      )
    );

    // Get installation token
    const token = await getInstallationAccessToken(organization.installationId);
    
    // Get all commit dates from GitHub
    const allGitHubDates = new Set<string>();
    
    for (const repo of repositories) {
      try {
        const commits = await getCommits(orgName, repo.name, token);
        
        // Handle case where commits is null or empty
        if (!commits || !Array.isArray(commits) || commits.length === 0) {
          console.log(`No commits found for repository: ${repo.name}`);
          continue;
        }

        commits.forEach(commit => {
          if (commit.commit?.author?.date) {
            allGitHubDates.add(new Date(commit.commit.author.date).toISOString().split('T')[0]);
          }
        });
      } catch (error) {
        // Log error but continue processing other repositories
        console.error(`Error fetching commits for repository ${repo.name}:`, error);
        continue;
      }
    }

    // Find dates that are in GitHub but not in our DB
    const datesToProcess = Array.from(allGitHubDates).filter(date => !existingDates.has(date));

    return successResponse(
      res,
      "Fetched dates that need processing",
      { 
        dates: datesToProcess,
        totalRepositories: repositories.length,
        processedRepositories: allGitHubDates.size > 0 ? repositories.length : 0
      },
      200
    );
  } catch (error) {
    console.error("Error fetching dates to process:", error);
    return errorResponse(res, "Failed to fetch dates to process", 500, error);
  }
}; 