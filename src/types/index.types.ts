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

export interface IGitHubComparison {
  url: string;
  html_url: string;
  permalink_url: string;
  diff_url: string;
  patch_url: string;
  base_commit: {
    sha: string;
    node_id: string;
    commit: {
      author: IGitHubUser;
      committer: IGitHubUser;
      message: string;
      tree: {
        sha: string;
        url: string;
      };
      url: string;
      comment_count: number;
      verification: {
        verified: boolean;
        reason: string;
        signature: string | null;
        payload: string | null;
      };
    };
    url: string;
    html_url: string;
    comments_url: string;
    author: IGitHubUser;
    committer: IGitHubUser;
    parents: Array<{
      sha: string;
      url: string;
      html_url: string;
    }>;
  };
  merge_base_commit: {
    sha: string;
    node_id: string;
    commit: {
      author: IGitHubUser;
      committer: IGitHubUser;
      message: string;
      tree: {
        sha: string;
        url: string;
      };
      url: string;
      comment_count: number;
      verification: {
        verified: boolean;
        reason: string;
        signature: string | null;
        payload: string | null;
      };
    };
    url: string;
    html_url: string;
    comments_url: string;
    author: IGitHubUser;
    committer: IGitHubUser;
    parents: Array<{
      sha: string;
      url: string;
      html_url: string;
    }>;
  };
  status: 'ahead' | 'behind' | 'identical';
  ahead_by: number;
  behind_by: number;
  total_commits: number;
  commits: Array<{
    sha: string;
    node_id: string;
    commit: {
      author: IGitHubUser;
      committer: IGitHubUser;
      message: string;
      tree: {
        sha: string;
        url: string;
      };
      url: string;
      comment_count: number;
      verification: {
        verified: boolean;
        reason: string;
        signature: string | null;
        payload: string | null;
      };
    };
    url: string;
    html_url: string;
    comments_url: string;
    author: IGitHubUser;
    committer: IGitHubUser;
    parents: Array<{
      sha: string;
      url: string;
      html_url: string;
    }>;
  }>;
  files: Array<{
    sha: string;
    filename: string;
    status: 'added' | 'removed' | 'modified' | 'renamed';
    additions: number;
    deletions: number;
    changes: number;
    blob_url: string;
    raw_url: string;
    contents_url: string;
    patch?: string;
  }>;
}

export interface IRepository {
  repoId: number;
  name: string;
  fullName: string;
  private: boolean;
  owner: Types.ObjectId;
  defaultBranch: string;
  createdAt: Date;
  updatedAt: Date;
  organization?: Types.ObjectId;
}

export interface IPushEvent {
  repository: Types.ObjectId;
  organization: Types.ObjectId;
  pusher: Types.ObjectId;
  beforeSha: string;
  afterSha: string;
  created: boolean;
  deleted: boolean;
  forced: boolean;
  compareUrl: string;
  commits: Types.ObjectId[];
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

export interface IOrganization {
  orgId: number;
  name: string;
  avatarUrl: string;
  url: string;
  reposUrl: string;
  description?: string;
  owner: Types.ObjectId;
  members: Types.ObjectId[];
  repositories: Types.ObjectId[];
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

export interface GitHubWebhookHeaders {
  'x-hub-signature-256'?: string;
  'x-github-hook-installation-target-id'?: string;
  'x-github-delivery'?: string;
  'x-github-event'?: string;
}

export interface IGitHubDiffSummary {
  summary: string;
}

export interface GitHubWebhookPayload {
  repository: {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    owner: {
      id: number;
      login: string;
    };
    default_branch: string;
    created_at: string;
    updated_at: string;
  };
  organization: {
    id: number;
    login: string;
    avatar_url: string;
    url: string;
    repos_url: string;
    description: string;
  };
  sender: {
    id: number;
    login: string;
    avatar_url: string;
    html_url: string;
  };
  pusher: {
    name: string;
    email: string;
  };
  before: string;
  after: string;
  created: boolean;
  deleted: boolean;
  forced: boolean;
  compare: string;
  commits: Array<{
    id: string;
    message: string;
    timestamp: string;
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
    additions: number;
    deletions: number;
    changes: number;
  }>;
  pushed_at: string;
  installation: {
    id: number;
  };
}