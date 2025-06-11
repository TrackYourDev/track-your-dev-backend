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

export const previewAllData = async (req: Request, res: Response) => {
  try {
    console.time('previewAllData');
    
    // Get all installations in parallel
    const installations = await getInstallations();
    console.log(`Found ${installations.length} installations`);

    // Process all installations in parallel
    const results = await Promise.all(
      installations.map(async (installation) => {
        try {
          const { id: installationId, account } = installation;
          const orgLogin = account.login;

          // Get token and repos in parallel
          const [token, existingOrg] = await Promise.all([
            getInstallationAccessToken(installationId),
            Organization.findOne({ orgId: account.id }).lean()
          ]);

          // If org exists and has repos, skip fetching from GitHub
          if (existingOrg) {
            const existingRepos = await Repository.find({ organization: existingOrg._id }).lean();
            if (existingRepos.length > 0) {
              console.log(`Found existing data for ${orgLogin}, skipping GitHub fetch`);
              return {
                organization: {
                  login: orgLogin,
                  installationId,
                },
                repositories: existingRepos.map(repo => ({
                  name: repo.name,
                  id: repo.repoId
                })),
                source: 'database'
              };
            }
          }

          // Fetch repos from GitHub
          const repos = await getRepositories(token);
          console.log(`Fetched ${repos.length} repos for ${orgLogin}`);

          // Store organization
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

          // Process all repositories in parallel
          const repoPromises = repos.map(async (repo) => {
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

          const savedRepos = await Promise.all(repoPromises);

          return {
            organization: {
              login: orgLogin,
              installationId,
            },
            repositories: savedRepos.map(repo => ({
              name: repo.name,
              id: repo.repoId
            })),
            source: 'github'
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

    console.timeEnd('previewAllData');

    // Filter out failed installations
    const successfulResults = results.filter(result => !result.error);
    const failedResults = results.filter(result => result.error);

    return successResponse(
      res,
      "Fetched and stored organizations and repositories",
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
    return errorResponse(res, "Failed to fetch GitHub preview", 500, error);
  }
};
