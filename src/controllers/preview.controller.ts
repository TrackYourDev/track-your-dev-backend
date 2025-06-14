import { Request, Response } from "express";
import {
  getUserInstallations,
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
    const githubToken = req.cookies['github_token'];
    
    if (!githubToken) {
      return errorResponse(res, "GitHub token not found", 401);
    }

    // Get user from database
    console.time('findUser');
    const user = await User.findOne({ githubId });
    console.timeEnd('findUser');
    
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }
    
    // Get user-specific installations
    console.time('getUserInstallations');
    const installations = await getUserInstallations(githubToken);
    console.timeEnd('getUserInstallations');
    console.log(`Found ${installations.length} installations for user`);

    // Get all organization IDs
    const orgIds = installations.map(inst => inst.account.id);
    
    // Fetch all existing organizations and their repos in parallel
    console.time('fetchExistingData');
    const [existingOrgs, existingRepos] = await Promise.all([
      Organization.find({ orgId: { $in: orgIds } }).lean(),
      Repository.find({ 
        organization: { 
          $in: await Organization.find({ orgId: { $in: orgIds } }).distinct('_id') 
        } 
      }).lean()
    ]);
    console.timeEnd('fetchExistingData');

    // Create a map for quick lookups
    const orgMap = new Map(existingOrgs.map(org => [org.orgId, org]));
    const repoMap = new Map(existingRepos.map(repo => [repo.repoId, repo]));

    // Process all installations in parallel
    console.time('processInstallations');
    
    // Prepare organization data for batch update
    const orgUpdates = installations.map(installation => ({
      updateOne: {
        filter: { orgId: installation.account.id },
        update: {
          $set: {
            orgId: installation.account.id,
            installationId: installation.id,
            name: installation.account.login,
            avatarUrl: installation.account.avatar_url,
            url: installation.account.url,
            reposUrl: installation.account.repos_url,
            description: installation.account.description,
            owner: user._id
          },
          $addToSet: { members: user._id }
        },
        upsert: true
      }
    }));

    // Batch update organizations
    console.time('batchUpdateOrgs');
    await Organization.bulkWrite(orgUpdates);
    console.timeEnd('batchUpdateOrgs');

    // Get updated organizations
    const updatedOrgs = await Organization.find({ orgId: { $in: orgIds } }).lean();
    const updatedOrgMap = new Map(updatedOrgs.map(org => [org.orgId, org]));

    // Process repositories in parallel
    const repoResults = await Promise.all(
      installations.map(async (installation) => {
        try {
          const { id: installationId, account } = installation;
          const orgLogin = account.login;
          const existingOrg = updatedOrgMap.get(account.id);
          const existingOrgRepos = existingRepos.filter(repo => 
            repo.organization && existingOrg && 
            repo.organization.toString() === existingOrg._id.toString()
          );

          console.log(`Found ${existingOrgRepos.length} existing repos for ${orgLogin}`);

          // Get repositories from the installation data
          const githubRepos = installation.repositories || [];
          console.log(`Fetched ${githubRepos.length} repos from GitHub for ${orgLogin}`);

          // Find new repos that aren't in our database
          const newRepos = githubRepos.filter((repo: { id: number }) => !repoMap.has(repo.id));

          // Prepare repository data for batch insert
          if (newRepos.length > 0) {
            console.time(`insertRepos-${installationId}`);
            const repoData = newRepos.map((repo: { 
              id: number;
              name: string;
              full_name: string;
              private: boolean;
              default_branch: string;
              created_at: string;
              updated_at: string;
            }) => ({
              repoId: repo.id,
              name: repo.name,
              fullName: repo.full_name,
              private: repo.private,
              defaultBranch: repo.default_branch,
              organization: existingOrg?._id,
              owner: user._id,
              createdAt: new Date(repo.created_at),
              updatedAt: new Date(repo.updated_at),
              enabledForTasks: false
            }));

            await Repository.insertMany(repoData, { ordered: false });
            console.timeEnd(`insertRepos-${installationId}`);
            console.log(`Added ${newRepos.length} new repos for ${orgLogin}`);
          }

          // Combine existing and new repos
          const allRepos = [
            ...existingOrgRepos,
            ...newRepos.map((repo: { 
              id: number;
              name: string;
              full_name: string;
              private: boolean;
              default_branch: string;
              created_at: string;
              updated_at: string;
            }) => ({
              repoId: repo.id,
              name: repo.name,
              fullName: repo.full_name,
              private: repo.private,
              defaultBranch: repo.default_branch,
              organization: existingOrg?._id,
              owner: user._id,
              createdAt: new Date(repo.created_at),
              updatedAt: new Date(repo.updated_at),
              enabledForTasks: false
            }))
          ];

          // Sort repositories by updatedAt in descending order
          const sortedRepos = allRepos.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );

          return {
            organization: {
              login: orgLogin,
              installationId,
              id: existingOrg?._id,
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
              enabledForTasks: repo.enabledForTasks || false
            })),
            stats: {
              existingRepos: existingOrgRepos.length,
              newRepos: newRepos.length,
              totalRepos: allRepos.length
            }
          };
        } catch (error: unknown) {
          console.error(`Error processing installation ${installation.id}:`, error);
          return {
            organization: {
              login: installation.account.login,
              installationId: installation.id,
            },
            error: error instanceof Error ? error.message : 'Unknown error',
            repositories: []
          };
        }
      })
    );
    console.timeEnd('processInstallations');

    console.timeEnd('syncAndGetData');

    // Filter out failed installations
    const successfulResults = repoResults.filter(result => !result.error);
    const failedResults = repoResults.filter(result => result.error);

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
