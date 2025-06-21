"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserFromGitHub = void 0;
const users_model_1 = require("../models/users.model");
const axios_1 = __importDefault(require("axios"));
const createUserFromGitHub = async (githubId, githubToken) => {
    try {
        // Fetch user data from GitHub API
        const response = await axios_1.default.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${githubToken}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        const githubData = response.data;
        // Calculate subscription expiration date (3 days from now)
        const subscriptionExpiresAt = new Date();
        subscriptionExpiresAt.setDate(subscriptionExpiresAt.getDate() + 3);
        // Create new user in database
        const newUser = await users_model_1.User.create({
            githubId: githubData.id,
            login: githubData.login,
            name: githubData.name || githubData.login,
            email: githubData.email,
            avatarUrl: githubData.avatar_url,
            profileUrl: githubData.html_url,
            isSubscribed: true,
            subscriptionExpiresAt
        });
        return newUser;
    }
    catch (error) {
        console.error('Error creating user from GitHub:', error);
        throw error;
    }
};
exports.createUserFromGitHub = createUserFromGitHub;
