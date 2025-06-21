"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatesToProcess = void 0;
const organisations_model_1 = require("../models/organisations.model");
const repositories_model_1 = require("../models/repositories.model");
const commits_model_1 = require("../models/commits.model");
const responseHendler_1 = require("../utils/responseHendler");
const githubPreview_service_1 = require("../services/githubPreview.service");
const getDatesToProcess = async (req, res) => {
    try {
        const { orgName } = req.params;
        // Find the organization
        const organization = await organisations_model_1.Organization.findOne({ name: orgName });
        if (!organization) {
            return (0, responseHendler_1.errorResponse)(res, "Organization not found", 404);
        }
        // Get all repositories for this organization
        const repositories = await repositories_model_1.Repository.find({ organization: organization._id });
        // Get all commit dates from our database for these repositories
        const existingCommits = await commits_model_1.Commit.find({
            repository: { $in: repositories.map(repo => repo._id) }
        }).select('commitTime');
        const existingDates = new Set(existingCommits.map(commit => new Date(commit.commitTime).toISOString().split('T')[0]));
        // Get installation token
        const token = await (0, githubPreview_service_1.getInstallationAccessToken)(organization.installationId);
        // Get all commit dates from GitHub
        const allGitHubDates = new Set();
        for (const repo of repositories) {
            try {
                const commits = await (0, githubPreview_service_1.getCommits)(orgName, repo.name, token);
                // Handle case where commits is null or empty
                if (!commits || !Array.isArray(commits) || commits.length === 0) {
                    console.log(`No commits found for repository: ${repo.name}`);
                    continue;
                }
                commits.forEach(commit => {
                    if (commit.commit?.author?.date) {
                        allGitHubDates.add(new Date(commit.commit.author.date).toISOString().split('T')[0]);
                    }
                });
            }
            catch (error) {
                // Log error but continue processing other repositories
                console.error(`Error fetching commits for repository ${repo.name}:`, error);
                continue;
            }
        }
        // Find dates that are in GitHub but not in our DB
        const datesToProcess = Array.from(allGitHubDates).filter(date => !existingDates.has(date));
        return (0, responseHendler_1.successResponse)(res, "Fetched dates that need processing", {
            dates: datesToProcess,
            totalRepositories: repositories.length,
            processedRepositories: allGitHubDates.size > 0 ? repositories.length : 0
        }, 200);
    }
    catch (error) {
        console.error("Error fetching dates to process:", error);
        return (0, responseHendler_1.errorResponse)(res, "Failed to fetch dates to process", 500, error);
    }
};
exports.getDatesToProcess = getDatesToProcess;
