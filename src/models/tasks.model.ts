import { Schema, model } from 'mongoose';
import { ITask } from '../types/index.types';

const CommentSchema = new Schema({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String },
  status: { 
    type: String, 
    enum: ['todo', 'in-progress', 'done'], 
    default: 'todo' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  assignee: { type: Schema.Types.ObjectId, ref: 'User' },
  dueDate: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  repository: { type: Schema.Types.ObjectId, ref: 'Repository' },
  tags: [{ type: String }],
  estimatedHours: { type: Number },
  actualHours: { type: Number },
  attachments: [{ type: String }],
  comments: [CommentSchema]
}, { 
  timestamps: true 
});

// Indexes for better query performance
TaskSchema.index({ organization: 1, status: 1 });
TaskSchema.index({ assignee: 1 });
TaskSchema.index({ createdBy: 1 });
TaskSchema.index({ dueDate: 1 });

export const Task = model<ITask>('Task', TaskSchema); 