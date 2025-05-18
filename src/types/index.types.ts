import { Document } from 'mongoose';
export interface ICommit extends Document {
  sha: string;
  message: string;
  timestamp: Date;
  url: string;
  files: {
    added: string[];
    removed: string[];
    modified: string[];
  };
  repository: {
    id: number;
    full_name: string;
    private: boolean;
    html_url: string;
  };
  author: {
    username: string;
    name: string;
    email: string;
  };
  pusher: {
    name: string;
    email: string;
  };
  sender: {
    login: string;
    avatar_url: string;
    profile_url: string;
  };
  organization?: {
    login: string;
    avatar_url: string;
    url: string;
  };
  summary?: string; // AI-generated summary
}

export interface IUser extends Document {
  username: string;
  email?: string;
  avatar_url?: string;
  profile_url?: string;
}

export interface IRepository extends Document {
  repo_id: number;
  full_name: string;
  private: boolean;
  html_url: string;
  organization?: {
    login: string;
    avatar_url?: string;
    url?: string;
  };
}