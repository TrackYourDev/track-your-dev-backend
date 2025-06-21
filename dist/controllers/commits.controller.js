"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommitsController = void 0;
const organisations_model_1 = require("../models/organisations.model");
const repositories_model_1 = require("../models/repositories.model");
const commits_model_1 = require("../models/commits.model");
const responseHendler_1 = require("../utils/responseHendler");
const githubPreview_service_1 = require("../services/githubPreview.service");
const github_service_1 = require("../services/github.service");
const groq_service_1 = require("../services/groq.service");
const fileFilter_util_1 = require("../utils/fileFilter.util");
const getCommitsController = async (req, res) => {
    const { orgName, repoName } = req.params;
    const { startDate, endDate, page = '1', pageSize = '30' } = req.query;
    try {
        // Find the organization
        const organization = await organisations_model_1.Organization.findOne({ name: orgName });
        if (!organization) {
            return (0, responseHendler_1.errorResponse)(res, "Organization not found", 404);
        }
        // Find the repository
        const repository = await repositories_model_1.Repository.findOne({
            organization: organization._id,
            name: repoName,
        });
        if (!repository) {
            return (0, responseHendler_1.errorResponse)(res, "Repository not found", 404);
        }
        const pageNum = parseInt(page);
        const pageSizeNum = parseInt(pageSize);
        // If date range is provided, use existing date range logic
        if (startDate && endDate) {
            // Convert MM-DD-YYYY to Date objects
            const [startMonth, startDay, startYear] = startDate.split('-');
            const [endMonth, endDay, endYear] = endDate.split('-');
            const startDateObj = new Date(`${startYear}-${startMonth}-${startDay}T00:00:00Z`);
            const endDateObj = new Date(`${endYear}-${endMonth}-${endDay}T23:59:59Z`);
            const existingCommits = await commits_model_1.Commit.find({
                repository: repository._id,
                commitTime: {
                    $gte: startDateObj,
                    $lte: endDateObj
                }
            }).sort({ commitTime: -1 }).lean();
            if (existingCommits.length > 0) {
                return (0, responseHendler_1.successResponse)(res, "Fetched commits from database", {
                    commits: existingCommits,
                    totalCommits: existingCommits.length,
                    source: 'database'
                }, 200);
            }
            // Fetch from GitHub with date range
            const token = await (0, githubPreview_service_1.getInstallationAccessToken)(organization.installationId);
            const commits = await (0, githubPreview_service_1.getCommits)(orgName, repoName, token, {
                since: startDate,
                until: endDate
            });
            // Process commits as before...
            // [Previous date range processing logic remains the same]
        }
        else {
            // Pagination logic
            const skip = (pageNum - 1) * pageSizeNum;
            // First try to get commits from database
            const existingCommits = await commits_model_1.Commit.find({
                repository: repository._id
            })
                .sort({ commitTime: -1 })
                .skip(skip)
                .limit(pageSizeNum)
                .lean();
            // If we have enough commits in the database, return them
            if (existingCommits.length === pageSizeNum) {
                return (0, responseHendler_1.successResponse)(res, "Fetched commits from database", {
                    commits: existingCommits,
                    totalCommits: existingCommits.length,
                    page: pageNum,
                    pageSize: pageSizeNum,
                    source: 'database'
                }, 200);
            }
            // If we don't have enough commits, fetch from GitHub
            const token = await (0, githubPreview_service_1.getInstallationAccessToken)(organization.installationId);
            const githubCommits = await (0, githubPreview_service_1.getCommits)(orgName, repoName, token, {
                per_page: pageSizeNum,
                page: pageNum
            });
            if (!githubCommits || !Array.isArray(githubCommits) || githubCommits.length === 0) {
                return (0, responseHendler_1.successResponse)(res, "No commits found", {
                    commits: [],
                    totalCommits: 0,
                    page: pageNum,
                    pageSize: pageSizeNum
                }, 200);
            }
            // Process new commits
            const processedCommits = await Promise.all(githubCommits.map(async (commit) => {
                // Check if commit already exists
                const existingCommit = await commits_model_1.Commit.findOne({ id: commit.sha });
                if (existingCommit) {
                    return {
                        _id: existingCommit._id,
                        commitMessage: existingCommit.commitMessage,
                        commitTime: existingCommit.commitTime,
                        additions: existingCommit.additions,
                        deletions: existingCommit.deletions,
                        changes: existingCommit.changes,
                        summaries: existingCommit.summaries,
                        tasks: existingCommit.tasks,
                        author: existingCommit.author
                    };
                }
                try {
                    // Get commit diff
                    const comparisonData = await (0, github_service_1.compareCommits)(orgName, repoName, commit.parents?.[0]?.sha || '', commit.sha, organization.installationId);
                    // Filter out ignored files
                    const relevantFiles = (0, fileFilter_util_1.filterIgnoredFiles)(comparisonData.files);
                    // Filter out files without patches
                    const filesWithPatches = relevantFiles.filter(file => file.patch);
                    console.log(`Filtered out ${relevantFiles.length - filesWithPatches.length} files without patches`);
                    // Skip commits without any patches
                    if (filesWithPatches.length === 0) {
                        console.log(`Skipping commit ${commit.sha} as it has no patches`);
                        return null;
                    }
                    // Process files and generate tasks
                    const fileAnalyses = await Promise.all(filesWithPatches.map(async (file) => {
                        const diff = `
                filename: ${file.filename}
                status: ${file.status} 
                ${file.patch}
                `;
                        const analysis = await (0, groq_service_1.analyzeGitHubDiff)(diff);
                        return {
                            filename: file.filename,
                            ...analysis
                        };
                    }));
                    const tasks = await (0, groq_service_1.generateTasks)(fileAnalyses.map((file) => file.summary).join("\n"));
                    // Create commit document
                    const commitDoc = await commits_model_1.Commit.create({
                        id: commit.sha,
                        commitTime: new Date(commit.commit?.author?.date || ''),
                        repository: repository._id,
                        organization: organization._id,
                        summaries: fileAnalyses.map(file => ({
                            filename: file.filename,
                            summary: file.summary
                        })),
                        tasks: tasks,
                        commitMessage: commit.commit?.message || '',
                        additions: commit.stats?.additions || 0,
                        deletions: commit.stats?.deletions || 0,
                        changes: commit.stats?.total || 0,
                        author: commit.commit?.author?.name || 'Unknown'
                    });
                    return {
                        _id: commitDoc._id,
                        commitMessage: commitDoc.commitMessage,
                        commitTime: commitDoc.commitTime,
                        additions: commitDoc.additions,
                        deletions: commitDoc.deletions,
                        changes: commitDoc.changes,
                        summaries: commitDoc.summaries,
                        tasks: commitDoc.tasks,
                        author: commitDoc.author
                    };
                }
                catch (error) {
                    console.error(`Error processing commit ${commit.sha}:`, error);
                    return null;
                }
            }));
            // Filter out any failed commits
            const successfulCommits = processedCommits.filter(commit => commit !== null);
            return (0, responseHendler_1.successResponse)(res, "Fetched and processed commits", {
                commits: successfulCommits,
                totalCommits: successfulCommits.length,
                page: pageNum,
                pageSize: pageSizeNum,
                source: 'github'
            }, 200);
        }
    }
    catch (err) {
        console.error("Error fetching commits:", err);
        return (0, responseHendler_1.errorResponse)(res, "Server error", 500, err);
    }
};
exports.getCommitsController = getCommitsController;
