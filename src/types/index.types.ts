import { Document,Types } from 'mongoose';
interface IFileChange {
  filePath: string;
  changeType: 'added' | 'removed' | 'modified';
}

interface IGitHubUser {
  name?: string;
  email?: string | null;
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
}

interface IGitHubRepository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: IGitHubUser;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  created_at: number;
  updated_at: string;
  pushed_at: number;
  git_url: string;
  ssh_url: string;
  clone_url: string;
  default_branch: string;
  organization?: string;
}

interface IGitHubOrganization {
  login: string;
  id: number;
  node_id: string;
  url: string;
  repos_url: string;
  events_url: string;
  hooks_url: string;
  issues_url: string;
  members_url: string;
  public_members_url: string;
  avatar_url: string;
  description: string;
}

interface IGitHubCommit {
  id: string;
  tree_id: string;
  distinct: boolean;
  message: string;
  timestamp: string;
  url: string;
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
  added: string[];
  removed: string[];
  modified: string[];
}

export interface GitHubWebhookPayload {
  ref: string;
  before: string;
  after: string;
  repository: IGitHubRepository;
  pusher: {
    name: string;
    email: string;
  };
  organization: IGitHubOrganization;
  sender: IGitHubUser;
  installation: {
    id: number;
    node_id: string;
  };
  created: boolean;
  deleted: boolean;
  forced: boolean;
  base_ref: string | null;
  compare: string;
  commits: IGitHubCommit[];
  head_commit: IGitHubCommit;
  pushed_at: number;
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