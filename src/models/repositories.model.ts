import mongoose, { Schema } from 'mongoose';
import { IRepository } from '../types/index.types';


const RepositorySchema: Schema = new Schema(
  {
    repo_id: { type: Number, required: true, unique: true },
    full_name: { type: String, required: true },
    private: { type: Boolean, default: true },
    html_url: { type: String, required: true },
    organization: {
      login: { type: String },
      avatar_url: { type: String },
      url: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

export const Repository = mongoose.model<IRepository>('Repository', RepositorySchema);
