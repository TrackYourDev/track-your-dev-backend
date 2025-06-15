import { User } from "../models/users.model";
import axios from "axios";

interface GitHubUserData {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  html_url: string;
}

export const createUserFromGitHub = async (githubId: number, githubToken: string): Promise<any> => {
  try {
    // Fetch user data from GitHub API
    const response = await axios.get<GitHubUserData>('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    const githubData = response.data;

    // Calculate subscription expiration date (3 days from now)
    const subscriptionExpiresAt = new Date();
    subscriptionExpiresAt.setDate(subscriptionExpiresAt.getDate() + 3);

    // Create new user in database
    const newUser = await User.create({
      githubId: githubData.id,
      login: githubData.login,
      name: githubData.name || githubData.login,
      email: githubData.email,
      avatarUrl: githubData.avatar_url,
      profileUrl: githubData.html_url,
      isSubscribed: true,
      subscriptionExpiresAt
    });

    return newUser;
  } catch (error) {
    console.error('Error creating user from GitHub:', error);
    throw error;
  }
}; 