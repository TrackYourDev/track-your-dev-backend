import { Schema, model } from 'mongoose';
import { IRepository } from '../types/index.types';

const RepositorySchema = new Schema<IRepository>({
  repoId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  fullName: { type: String, required: true },
  private: { type: Boolean, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  defaultBranch: { type: String, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
  enabledForTasks: { type: Boolean, default: true },
});

export const Repository = model<IRepository>('Repository', RepositorySchema);