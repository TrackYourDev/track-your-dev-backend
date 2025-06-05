import { IGitHubComparison } from "../types/index.types";
import generateJwtToken from "../utils/generateJWT";

async function getInstallationAccessToken(installationId: number): Promise<string> {
  const response = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${generateJwtToken()}`,
      Accept: 'application/vnd.github+json'
    }
  });

  const data = await response.json() as { token: string };
  return data.token;
}

export async function compareCommits(
  organization: string,
  repository: string,
  beforeCommitHash: string,
  afterCommitHash: string,
  installationId: number
): Promise<IGitHubComparison> {
  const installationAccessToken = await getInstallationAccessToken(installationId);

  const response = await fetch(
    `https://api.github.com/repos/${organization}/${repository}/compare/${beforeCommitHash}...${afterCommitHash}`,
    {
      headers: {
        Authorization: `token ${installationAccessToken}`,
        Accept: 'application/vnd.github+json'
      }
    }
  );
  
  return response.json() as Promise<IGitHubComparison>;
} 