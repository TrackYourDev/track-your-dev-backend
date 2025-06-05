import { IGitHubComparison } from "../types/index.types";
import jwtToken from "../utils/generateJWT";

export class GitHubService {
  private static async getInstallationAccessToken(installationId: number): Promise<string> {
    const response = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        Accept: 'application/vnd.github+json'
      }
    });

    const data = await response.json() as { token: string };
    return data.token;
  }

  public static async compareCommits(
    organization: string,
    repository: string,
    beforeCommitHash: string,
    afterCommitHash: string,
    installationId: number
  ): Promise<IGitHubComparison> {
    const installationAccessToken = await this.getInstallationAccessToken(installationId);

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
} 