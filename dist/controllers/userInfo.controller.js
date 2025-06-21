"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserInfoController = void 0;
const users_model_1 = require("../models/users.model");
const organisations_model_1 = require("../models/organisations.model");
const repositories_model_1 = require("../models/repositories.model");
const responseHendler_1 = require("../utils/responseHendler");
const getUserInfoController = async (req, res) => {
    const githubId = req.githubId;
    try {
        const user = await users_model_1.User.findOne({ githubId });
        if (!user)
            return (0, responseHendler_1.errorResponse)(res, "User not found", 404);
        // Get all organizations where the user is a member
        const organizations = await organisations_model_1.Organization.find({
            $or: [
                { owner: user._id },
                { members: user._id }
            ]
        });
        if (!organizations.length)
            return (0, responseHendler_1.errorResponse)(res, "No organizations found", 404);
        const orgData = [];
        for (const org of organizations) {
            const repositories = await repositories_model_1.Repository.find({ organization: org._id });
            const enrichedRepos = repositories.map((repo) => ({
                _id: repo._id,
                name: repo.name,
                private: repo.private,
            }));
            orgData.push({
                _id: org._id,
                name: org.name,
                avatarUrl: org.avatarUrl,
                description: org.description,
                repositories: enrichedRepos,
            });
        }
        (0, responseHendler_1.successResponse)(res, "Fetched user Information successfully", { organizations: orgData }, 200);
    }
    catch (err) {
        console.error("Error fetching user Information:", err);
        (0, responseHendler_1.errorResponse)(res, "Server error", 500, err);
    }
};
exports.getUserInfoController = getUserInfoController;
