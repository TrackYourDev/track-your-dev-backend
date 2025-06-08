import { Schema, model } from 'mongoose';
import { IOrganization } from '../types/index.types';

const OrganizationSchema = new Schema<IOrganization>(
  {
    orgId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    avatarUrl: { type: String, required: true },
    url: { type: String, required: true },
    reposUrl: { type: String, required: true },
    description: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    repositories: [{ type: Schema.Types.ObjectId, ref: 'Repository' }]
  },
  { timestamps: true }
);

export const Organization = model<IOrganization>('Organization', OrganizationSchema); 