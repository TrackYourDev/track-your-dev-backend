import generateJwtToken from "../utils/generateJWT";

export async function getUserInstallations(userToken: string): Promise<any[]> {
  try {
    // First get all installations using the app JWT
    const jwt = generateJwtToken();
    console.log('Fetching all installations with JWT...');
    const response = await fetch("https://api.github.com/app/installations", {
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/vnd.github+json",
        'User-Agent': 'trackyourdev'
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to fetch installations:', errorData);
      throw new Error(`GitHub API error: ${errorData.message || response.statusText}`);
    }

    const installations = await response.json();
    console.log('All installations:', installations);

    // Get current user info to check membership
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${userToken}`,
        Accept: "application/vnd.github+json",
        'User-Agent': 'trackyourdev'
      },
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      console.error('Failed to fetch user info:', errorData);
      throw new Error(`Failed to fetch user info: ${errorData.message || userResponse.statusText}`);
    }

    const userData = await userResponse.json();
    console.log('Current user:', userData.login);

    // Process each installation to check user membership
    const userAccessibleInstallations = await Promise.all(
      installations.map(async (installation: any) => {
        try {
          // Get installation access token
          console.log(`Getting access token for installation ${installation.id}...`);
          const token = await getInstallationAccessToken(installation.id);

          // For user accounts, check if it's the current user's account
          if (installation.account.type === 'User') {
            if (installation.account.login === userData.login) {
              console.log(`Installation belongs to current user ${userData.login}`);
            } else {
              console.log(`Installation belongs to different user ${installation.account.login}`);
              return null;
            }
          } 
          // For organizations, check membership using installation token
          else if (installation.account.type === 'Organization') {
            console.log(`Checking membership for org ${installation.account.login}...`);
            
            // Use installation token to check membership
            const membershipResponse = await fetch(
              `https://api.github.com/orgs/${installation.account.login}/members/${userData.login}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/vnd.github+json",
                  'User-Agent': 'trackyourdev'
                },
              }
            );

            if (membershipResponse.status === 404) {
              console.log(`User is not a member of ${installation.account.login}`);
              return null;
            }

            if (!membershipResponse.ok) {
              console.error(`Failed to check membership for ${installation.account.login}:`, await membershipResponse.json());
              return null;
            }

            console.log(`User is a member of ${installation.account.login}`);
          }

          // Get repositories for this installation
          console.log(`Fetching repositories for installation ${installation.id}...`);
          const reposResponse = await fetch("https://api.github.com/installation/repositories", {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github+json",
              'User-Agent': 'trackyourdev'
            },
          });

          if (!reposResponse.ok) {
            const errorData = await reposResponse.json();
            console.error(`Failed to fetch repositories for installation ${installation.id}:`, errorData);
            return null;
          }

          const reposData = await reposResponse.json();
          console.log(`Found ${reposData.repositories?.length || 0} repositories for installation ${installation.id}`);
          
          return {
            ...installation,
            repositories: reposData.repositories || []
          };
        } catch (error) {
          console.error(`Error processing installation ${installation.id}:`, error);
          return null;
        }
      })
    );

    // Filter out any failed installations
    const finalInstallations = userAccessibleInstallations.filter(Boolean);
    console.log('Final accessible installations:', finalInstallations);
    return finalInstallations;
  } catch (error) {
    console.error('Error fetching user installations:', error);
    throw error;
  }
}

export async function getInstallationAccessToken(installationId: number): Promise<string> {
  const jwt = generateJwtToken();

  const response = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: "application/vnd.github+json",
      'User-Agent': 'trackyourdev'
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to get installation token: ${errorData.message || response.statusText}`);
  }

  const data = await response.json();
  return data.token;
}

export async function getRepositories(installationToken: string): Promise<any[]> {
  const response = await fetch("https://api.github.com/installation/repositories", {
    headers: {
      Authorization: `Bearer ${installationToken}`,
      Accept: "application/vnd.github+json",
      'User-Agent': 'trackyourdev'
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to fetch repositories: ${errorData.message || response.statusText}`);
  }

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
      'User-Agent': 'trackyourdev'
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to fetch commits for ${repo}: ${errorData.message || response.statusText}`);
  }

  return response.json();
}
