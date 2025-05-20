import { Schema, model} from 'mongoose';
import {IRepository} from '../types/index.types';

const RepositorySchema = new Schema<IRepository>({
  repoId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  fullName: { type: String, required: true },
  private: { type: Boolean, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  defaultBranch: { type: String, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
  organization: {
    orgId: { type: Number },
    login: { type: String },
    avatarUrl: { type: String },
    url: { type: String },
    reposUrl: { type: String },
    description: { type: String },
  }
});


export const Repository = model<IRepository>('Repository', RepositorySchema);