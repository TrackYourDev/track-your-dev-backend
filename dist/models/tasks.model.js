"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const mongoose_1 = require("mongoose");
const CommentSchema = new mongoose_1.Schema({
    content: { type: String, required: true },
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});
const TaskSchema = new mongoose_1.Schema({
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
    assignee: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    dueDate: { type: Date },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    organization: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    repository: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Repository' },
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
exports.Task = (0, mongoose_1.model)('Task', TaskSchema);
