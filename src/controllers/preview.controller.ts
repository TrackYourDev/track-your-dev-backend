import { Request, Response } from "express";
import {
  getInstallations,
  getInstallationAccessToken,
  getRepositories,
  getCommits,
} from "../services/githubPreview.service";
import { successResponse, errorResponse } from "../utils/responseHendler";

export const previewAllData = async (req: Request, res: Response) => {
  try {
    const installations = await getInstallations();

    const result = [];

    for (const installation of installations) {
      const { id: installationId, account } = installation;
      const orgLogin = account.login;

      const token = await getInstallationAccessToken(installationId);
      const repos = await getRepositories(token);

      const repositoriesWithCommits = [];

      for (const repo of repos) {
        const commits = await getCommits(orgLogin, repo.name, token);
        repositoriesWithCommits.push({
          repoName: repo.name,
          repoId: repo.id,
          commits: commits.map((c) => ({
            sha: c.sha,
            message: c.commit?.message,
            date: c.commit?.author?.date,
            author: c.commit?.author?.name,
          })),
        });
      }

      result.push({
        organization: {
          login: orgLogin,
          installationId,
        },
        repositories: repositoriesWithCommits,
      });
    }

    return successResponse(res, "Fetched organization-repo-commits preview", result, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch GitHub preview", 500, error);
  }
};
