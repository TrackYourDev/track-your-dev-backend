import generateJwtToken from "../utils/generateJWT";

export async function getInstallations(): Promise<any[]> {
  const jwt = generateJwtToken();

  const response = await fetch("https://api.github.com/app/installations", {
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) throw new Error("Failed to fetch installations");

  const data = await response.json();
  return data;
}

export async function getInstallationAccessToken(installationId: number): Promise<string> {
  const jwt = generateJwtToken();

  const response = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) throw new Error("Failed to get installation token");

  const data = await response.json();
  return data.token;
}

export async function getRepositories(installationToken: string): Promise<any[]> {
  const response = await fetch("https://api.github.com/installation/repositories", {
    headers: {
      Authorization: `Bearer ${installationToken}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) throw new Error("Failed to fetch repositories");

  const data = await response.json();
  return data.repositories;
}

export async function getCommits(owner: string, repo: string, token: string): Promise<any[]> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) throw new Error(`Failed to fetch commits for ${repo}`);

  return response.json();
}
