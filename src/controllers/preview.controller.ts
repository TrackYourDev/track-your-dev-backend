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
    const installations = await getInstallations();
    const result = [];

    for (const installation of installations) {
      const { id: installationId, account } = installation;
      const orgLogin = account.login;

      const token = await getInstallationAccessToken(installationId);
      const repos = await getRepositories(token);

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

      // Store repositories
      for (const repo of repos) {
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

        await Repository.findOneAndUpdate(
          { repoId: repo.id },
          repoData,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }

      result.push({
        organization: {
          login: orgLogin,
          installationId,
        },
        repositories: repos.map(repo => ({
          name: repo.name,
          id: repo.id
        })),
      });
    }

    return successResponse(res, "Fetched and stored organizations and repositories", result, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch GitHub preview", 500, error);
  }
};
