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

export async function getCommits(
  owner: string, 
  repo: string, 
  token: string, 
  options?: {
    per_page?: number;
    page?: number;
    since?: string;
    until?: string;
  }
): Promise<any[]> {
  const queryParams = new URLSearchParams();
  
  if (options?.per_page) {
    queryParams.append('per_page', options.per_page.toString());
  }
  if (options?.page) {
    queryParams.append('page', options.page.toString());
  }
  if (options?.since) {
    // Convert MM-DD-YYYY to ISO format
    const [month, day, year] = options.since.split('-');
    const sinceDate = new Date(`${year}-${month}-${day}T00:00:00Z`);
    queryParams.append('since', sinceDate.toISOString());
  }
  if (options?.until) {
    // Convert MM-DD-YYYY to ISO format
    const [month, day, year] = options.until.split('-');
    const untilDate = new Date(`${year}-${month}-${day}T23:59:59Z`);
    queryParams.append('until', untilDate.toISOString());
  }

  const queryString = queryParams.toString();
  const url = `https://api.github.com/repos/${owner}/${repo}/commits${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to fetch commits for ${repo}: ${error.message || response.statusText}`);
  }

  return response.json();
}
