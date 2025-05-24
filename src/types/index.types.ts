import { Document,Types } from 'mongoose';
interface IFileChange {
  filePath: string;
  changeType: 'added' | 'removed' | 'modified';
}
export interface ICommit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    username: string;
  };
  committer: {
    name: string;
    email: string;
    username: string;
  };
  timestamp: Date;
  treeId: string;
  distinct: boolean;
  fileChanges: IFileChange[];
}

export interface IPushEvent extends Document {
  repository: Types.ObjectId; // Reference to Repository
  pusher: Types.ObjectId; // Reference to User
  beforeSha: string;
  afterSha: string;
  created: boolean;
  deleted: boolean;
  forced: boolean;
  compareUrl: string;
  commits: ICommit[];
  pushedAt: Date;
}
export interface IUser extends Document {
  githubId: number;
  login: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  profileUrl?: string;
}

export interface IRepository extends Document {
  repoId: number;
  name: string;
  fullName: string;
  private: boolean;
  owner: string; 
  defaultBranch: string;
  createdAt: Date;
  updatedAt: Date;
   organization?: {
    orgId: number;
    login: string;
    avatarUrl?: string;
    url?: string;
    reposUrl?: string;
    description?: string;
  };
}

export interface GitHubWebhookHeaders {
  'x-hub-signature-256'?: string;
  'x-github-hook-installation-target-id'?: string;
  'x-github-delivery'?: string;
  'x-github-event'?: string;
}