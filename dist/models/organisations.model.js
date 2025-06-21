"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Organization = void 0;
const mongoose_1 = require("mongoose");
const OrganizationSchema = new mongoose_1.Schema({
    orgId: { type: Number, required: true, unique: true },
    installationId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    avatarUrl: { type: String, required: true },
    url: { type: String, required: true },
    reposUrl: { type: String, required: true },
    description: { type: String },
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    repositories: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Repository' }]
}, { timestamps: true });
exports.Organization = (0, mongoose_1.model)('Organization', OrganizationSchema);
