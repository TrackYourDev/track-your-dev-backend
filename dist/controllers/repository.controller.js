"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleTasksEnabled = toggleTasksEnabled;
const repositories_model_1 = require("../models/repositories.model");
const responseHendler_1 = require("../utils/responseHendler");
async function toggleTasksEnabled(req, res) {
    try {
        const { repoId, enabled } = req.body;
        if (!repoId || typeof enabled !== 'boolean') {
            return (0, responseHendler_1.errorResponse)(res, "Invalid request body. Required fields: repoId (string) and enabled (boolean)", 400);
        }
        const updatedRepo = await repositories_model_1.Repository.findOneAndUpdate({ repoId }, { enabledForTasks: enabled }, { new: true });
        if (!updatedRepo) {
            return (0, responseHendler_1.errorResponse)(res, "Repository not found", 404);
        }
        return (0, responseHendler_1.successResponse)(res, `Tasks ${enabled ? 'enabled' : 'disabled'} for repository successfully`, { repository: updatedRepo }, 200);
    }
    catch (error) {
        console.error("Error toggling tasks enabled status:", error);
        return (0, responseHendler_1.errorResponse)(res, "Failed to update repository", 500, error);
    }
}
