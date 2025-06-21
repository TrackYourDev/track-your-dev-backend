"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repository = void 0;
const mongoose_1 = require("mongoose");
const RepositorySchema = new mongoose_1.Schema({
    repoId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    fullName: { type: String, required: true },
    private: { type: Boolean, required: true },
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    defaultBranch: { type: String, required: true },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
    organization: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization' },
    enabledForTasks: { type: Boolean, default: true },
});
exports.Repository = (0, mongoose_1.model)('Repository', RepositorySchema);
