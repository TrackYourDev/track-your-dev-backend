"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commit = void 0;
const mongoose_1 = require("mongoose");
const CommitSummarySchema = new mongoose_1.Schema({
    filename: { type: String, required: true },
    summary: { type: String, required: true }
});
const TaskSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true }
});
const CommitTasksSchema = new mongoose_1.Schema({
    technicalTasks: [TaskSchema],
    nonTechnicalTasks: [TaskSchema]
});
const CommitSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    commitTime: { type: Date, required: true },
    repository: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Repository', required: true },
    organization: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    summaries: [CommitSummarySchema],
    tasks: {
        type: CommitTasksSchema,
        default: () => ({
            technicalTasks: [],
            nonTechnicalTasks: []
        })
    },
    commitMessage: { type: String, required: true },
    additions: { type: Number, required: true },
    deletions: { type: Number, required: true },
    changes: { type: Number, required: true },
    author: { type: String, required: true }
}, { timestamps: true });
// Add compound index for repository and commitTime
CommitSchema.index({ repository: 1, commitTime: 1 });
// Add index for organization
CommitSchema.index({ organization: 1 });
exports.Commit = (0, mongoose_1.model)("Commit", CommitSchema);
