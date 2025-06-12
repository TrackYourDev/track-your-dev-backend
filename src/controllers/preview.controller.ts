import { Request, Response } from "express";
import {
  getInstallations,
  getInstallationAccessToken,
  getRepositories,
} from "../services/githubPreview.service";
import { successResponse, errorResponse } from "../utils/responseHendler";
import { Organization } from "../models/organisations.model";
import { Repository } from "../models/repositories.model";
import { User } from "../models/users.model";
import { IRepository } from "../types/index.types";

export const syncAndGetData = async (req: Request, res: Response) => {
  try {
    console.time('syncAndGetData');
    const githubId = (req as any).githubId;
    
    // Get all installations in parallel
    const installations = await getInstallations();
    console.log(`Found ${installations.length} installations`);

    // Process all installations in parallel
    const results = await Promise.all(
      installations.map(async (installation) => {
        try {
          const { id: installationId, account } = installation;
          const orgLogin = account.login;

          // Get token and check existing data in parallel
          const [token, existingOrg] = await Promise.all([
            getInstallationAccessToken(installationId),
            Organization.findOne({ orgId: account.id }).lean()
          ]);

          // If org exists, get its repos
          let existingRepos: IRepository[] = [];
          if (existingOrg) {
            existingRepos = await Repository.find({ organization: existingOrg._id }).lean();
            console.log(`Found ${existingRepos.length} existing repos for ${orgLogin}`);
          }

          // Always fetch from GitHub to check for new repos
          const githubRepos = await getRepositories(token);
          console.log(`Fetched ${githubRepos.length} repos from GitHub for ${orgLogin}`);

          // Store/update organization
          const orgData = {
            orgId: account.id,
            installationId: installationId,
            name: orgLogin,
            avatarUrl: account.avatar_url,
            url: account.url,
            reposUrl: account.repos_url,
            description: account.description,
          };

          const orgDoc = await Organization.findOneAndUpdate(
            { orgId: account.id },
            orgData,
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );

          // Find new repos that aren't in our database
          const existingRepoIds = new Set(existingRepos.map(repo => repo.repoId));
          const newRepos = githubRepos.filter(repo => !existingRepoIds.has(repo.id));

          // Process new repos in parallel
          const repoPromises = newRepos.map(async (repo) => {
            const repoData = {
              repoId: repo.id,
              name: repo.name,
              fullName: repo.full_name,
              private: repo.private,
              defaultBranch: repo.default_branch,
              organization: orgDoc._id,
              createdAt: new Date(repo.created_at),
              updatedAt: new Date(repo.updated_at),
            };

            return Repository.findOneAndUpdate(
              { repoId: repo.id },
              repoData,
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );
          });

          const savedNewRepos = await Promise.all(repoPromises);
          console.log(`Added ${savedNewRepos.length} new repos for ${orgLogin}`);

          // Combine existing and new repos
          const allRepos = [...existingRepos, ...savedNewRepos];

          // Sort repositories by updatedAt in descending order
          const sortedRepos = allRepos.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );

          return {
            organization: {
              login: orgLogin,
              installationId,
              id: orgDoc._id,
              name: orgLogin,
              avatarUrl: account.avatar_url,
              url: account.url,
            },
            repositories: sortedRepos.map(repo => ({
              id: repo.repoId,
              name: repo.name,
              fullName: repo.fullName,
              private: repo.private,
              defaultBranch: repo.defaultBranch,
              createdAt: repo.createdAt,
              updatedAt: repo.updatedAt,
            })),
            stats: {
              existingRepos: existingRepos.length,
              newRepos: savedNewRepos.length,
              totalRepos: allRepos.length
            }
          };
        } catch (error: any) {
          console.error(`Error processing installation ${installation.id}:`, error);
          return {
            organization: {
              login: installation.account.login,
              installationId: installation.id,
            },
            error: error?.message || 'Unknown error',
            repositories: []
          };
        }
      })
    );

    console.timeEnd('syncAndGetData');

    // Filter out failed installations
    const successfulResults = results.filter(result => !result.error);
    const failedResults = results.filter(result => result.error);

    return successResponse(
      res,
      "Synced and fetched organizations and repositories",
      {
        results: successfulResults,
        failedResults: failedResults,
        stats: {
          total: installations.length,
          successful: successfulResults.length,
          failed: failedResults.length
        }
      },
      200
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to sync and fetch data", 500, error);
  }
};
