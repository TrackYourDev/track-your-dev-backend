"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaskStatsController = exports.addCommentController = exports.deleteTaskController = exports.updateTaskController = exports.getTaskByIdController = exports.getTasksController = exports.createTaskController = void 0;
const tasks_model_1 = require("../models/tasks.model");
const users_model_1 = require("../models/users.model");
const organisations_model_1 = require("../models/organisations.model");
const repositories_model_1 = require("../models/repositories.model");
const responseHendler_1 = require("../utils/responseHendler");
// Create a new task
const createTaskController = async (req, res) => {
    const githubId = req.githubId;
    try {
        const user = await users_model_1.User.findOne({ githubId });
        if (!user)
            return (0, responseHendler_1.errorResponse)(res, "User not found", 404);
        const { title, description, status, priority, assigneeId, dueDate, organizationId, repositoryId, tags, estimatedHours } = req.body;
        // Validate organization access
        const organization = await organisations_model_1.Organization.findOne({
            _id: organizationId,
            $or: [
                { owner: user._id },
                { members: user._id }
            ]
        });
        if (!organization) {
            return (0, responseHendler_1.errorResponse)(res, "Organization not found or access denied", 404);
        }
        // Validate assignee if provided
        let assignee = null;
        if (assigneeId) {
            assignee = await users_model_1.User.findById(assigneeId);
            if (!assignee) {
                return (0, responseHendler_1.errorResponse)(res, "Assignee not found", 404);
            }
        }
        // Validate repository if provided
        let repository = null;
        if (repositoryId) {
            // Check if repositoryId is a MongoDB ObjectId or GitHub repo ID
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(repositoryId);
            if (isObjectId) {
                // If it's a MongoDB ObjectId, search by _id
                repository = await repositories_model_1.Repository.findOne({
                    _id: repositoryId,
                    organization: organizationId
                });
            }
            else {
                // If it's a GitHub repo ID, search by repoId
                repository = await repositories_model_1.Repository.findOne({
                    repoId: parseInt(repositoryId),
                    organization: organizationId
                });
            }
            if (!repository) {
                return (0, responseHendler_1.errorResponse)(res, "Repository not found", 404);
            }
        }
        const task = new tasks_model_1.Task({
            title,
            description,
            status: status || 'todo',
            priority: priority || 'medium',
            assignee: assignee?._id,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            createdBy: user._id,
            organization: organization._id,
            repository: repository?._id,
            tags: tags || [],
            estimatedHours
        });
        await task.save();
        // Populate references for response
        await task.populate([
            { path: 'assignee', select: 'name login avatarUrl' },
            { path: 'createdBy', select: 'name login avatarUrl' },
            { path: 'repository', select: 'name fullName' }
        ]);
        (0, responseHendler_1.successResponse)(res, "Task created successfully", task, 201);
    }
    catch (err) {
        console.error("Error creating task:", err);
        (0, responseHendler_1.errorResponse)(res, "Server error", 500, err);
    }
};
exports.createTaskController = createTaskController;
// Get all tasks for an organization
const getTasksController = async (req, res) => {
    const githubId = req.githubId;
    const { organizationId } = req.params;
    const { status, assignee, priority, repository } = req.query;
    try {
        const user = await users_model_1.User.findOne({ githubId });
        if (!user)
            return (0, responseHendler_1.errorResponse)(res, "User not found", 404);
        // Validate organization access
        const organization = await organisations_model_1.Organization.findOne({
            _id: organizationId,
            $or: [
                { owner: user._id },
                { members: user._id }
            ]
        });
        if (!organization) {
            return (0, responseHendler_1.errorResponse)(res, "Organization not found or access denied", 404);
        }
        // Build query
        const query = { organization: organizationId };
        if (status)
            query.status = status;
        if (assignee)
            query.assignee = assignee;
        if (priority)
            query.priority = priority;
        if (repository)
            query.repository = repository;
        const tasks = await tasks_model_1.Task.find(query)
            .populate('assignee', 'name login avatarUrl')
            .populate('createdBy', 'name login avatarUrl')
            .populate('repository', 'name fullName')
            .sort({ createdAt: -1 });
        (0, responseHendler_1.successResponse)(res, "Tasks fetched successfully", tasks, 200);
    }
    catch (err) {
        console.error("Error fetching tasks:", err);
        (0, responseHendler_1.errorResponse)(res, "Server error", 500, err);
    }
};
exports.getTasksController = getTasksController;
// Get a single task by ID
const getTaskByIdController = async (req, res) => {
    const githubId = req.githubId;
    const { taskId } = req.params;
    try {
        const user = await users_model_1.User.findOne({ githubId });
        if (!user)
            return (0, responseHendler_1.errorResponse)(res, "User not found", 404);
        const task = await tasks_model_1.Task.findById(taskId)
            .populate('assignee', 'name login avatarUrl')
            .populate('createdBy', 'name login avatarUrl')
            .populate('repository', 'name fullName')
            .populate('comments.author', 'name login avatarUrl');
        if (!task) {
            return (0, responseHendler_1.errorResponse)(res, "Task not found", 404);
        }
        // Check if user has access to the task's organization
        const organization = await organisations_model_1.Organization.findOne({
            _id: task.organization,
            $or: [
                { owner: user._id },
                { members: user._id }
            ]
        });
        if (!organization) {
            return (0, responseHendler_1.errorResponse)(res, "Access denied", 403);
        }
        (0, responseHendler_1.successResponse)(res, "Task fetched successfully", task, 200);
    }
    catch (err) {
        console.error("Error fetching task:", err);
        (0, responseHendler_1.errorResponse)(res, "Server error", 500, err);
    }
};
exports.getTaskByIdController = getTaskByIdController;
// Update a task
const updateTaskController = async (req, res) => {
    const githubId = req.githubId;
    const { taskId } = req.params;
    try {
        const user = await users_model_1.User.findOne({ githubId });
        if (!user)
            return (0, responseHendler_1.errorResponse)(res, "User not found", 404);
        const task = await tasks_model_1.Task.findById(taskId);
        if (!task) {
            return (0, responseHendler_1.errorResponse)(res, "Task not found", 404);
        }
        // Check if user has access to the task's organization
        const organization = await organisations_model_1.Organization.findOne({
            _id: task.organization,
            $or: [
                { owner: user._id },
                { members: user._id }
            ]
        });
        if (!organization) {
            return (0, responseHendler_1.errorResponse)(res, "Access denied", 403);
        }
        // Validate assignee if being updated
        if (req.body.assigneeId) {
            const assignee = await users_model_1.User.findById(req.body.assigneeId);
            if (!assignee) {
                return (0, responseHendler_1.errorResponse)(res, "Assignee not found", 404);
            }
            req.body.assignee = assignee._id;
            delete req.body.assigneeId;
        }
        // Validate repository if being updated
        if (req.body.repositoryId) {
            // Check if repositoryId is a MongoDB ObjectId or GitHub repo ID
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.body.repositoryId);
            let repository;
            if (isObjectId) {
                // If it's a MongoDB ObjectId, search by _id
                repository = await repositories_model_1.Repository.findOne({
                    _id: req.body.repositoryId,
                    organization: task.organization
                });
            }
            else {
                // If it's a GitHub repo ID, search by repoId
                repository = await repositories_model_1.Repository.findOne({
                    repoId: parseInt(req.body.repositoryId),
                    organization: task.organization
                });
            }
            if (!repository) {
                return (0, responseHendler_1.errorResponse)(res, "Repository not found", 404);
            }
            req.body.repository = repository._id;
            delete req.body.repositoryId;
        }
        // Convert dueDate string to Date if provided
        if (req.body.dueDate) {
            req.body.dueDate = new Date(req.body.dueDate);
        }
        const updatedTask = await tasks_model_1.Task.findByIdAndUpdate(taskId, req.body, { new: true, runValidators: true })
            .populate('assignee', 'name login avatarUrl')
            .populate('createdBy', 'name login avatarUrl')
            .populate('repository', 'name fullName');
        (0, responseHendler_1.successResponse)(res, "Task updated successfully", updatedTask, 200);
    }
    catch (err) {
        console.error("Error updating task:", err);
        (0, responseHendler_1.errorResponse)(res, "Server error", 500, err);
    }
};
exports.updateTaskController = updateTaskController;
// Delete a task
const deleteTaskController = async (req, res) => {
    const githubId = req.githubId;
    const { taskId } = req.params;
    try {
        const user = await users_model_1.User.findOne({ githubId });
        if (!user)
            return (0, responseHendler_1.errorResponse)(res, "User not found", 404);
        const task = await tasks_model_1.Task.findById(taskId);
        if (!task) {
            return (0, responseHendler_1.errorResponse)(res, "Task not found", 404);
        }
        // Check if user has access to the task's organization
        const organization = await organisations_model_1.Organization.findOne({
            _id: task.organization,
            $or: [
                { owner: user._id },
                { members: user._id }
            ]
        });
        if (!organization) {
            return (0, responseHendler_1.errorResponse)(res, "Access denied", 403);
        }
        // Only task creator or organization owner can delete
        if (task.createdBy.toString() !== user._id.toString() &&
            organization.owner.toString() !== user._id.toString()) {
            return (0, responseHendler_1.errorResponse)(res, "Only task creator or organization owner can delete tasks", 403);
        }
        await tasks_model_1.Task.findByIdAndDelete(taskId);
        (0, responseHendler_1.successResponse)(res, "Task deleted successfully", null, 200);
    }
    catch (err) {
        console.error("Error deleting task:", err);
        (0, responseHendler_1.errorResponse)(res, "Server error", 500, err);
    }
};
exports.deleteTaskController = deleteTaskController;
// Add comment to a task
const addCommentController = async (req, res) => {
    const githubId = req.githubId;
    const { taskId } = req.params;
    const { content } = req.body;
    try {
        const user = await users_model_1.User.findOne({ githubId });
        if (!user)
            return (0, responseHendler_1.errorResponse)(res, "User not found", 404);
        const task = await tasks_model_1.Task.findById(taskId);
        if (!task) {
            return (0, responseHendler_1.errorResponse)(res, "Task not found", 404);
        }
        // Check if user has access to the task's organization
        const organization = await organisations_model_1.Organization.findOne({
            _id: task.organization,
            $or: [
                { owner: user._id },
                { members: user._id }
            ]
        });
        if (!organization) {
            return (0, responseHendler_1.errorResponse)(res, "Access denied", 403);
        }
        // Initialize comments array if it doesn't exist
        if (!task.comments) {
            task.comments = [];
        }
        task.comments.push({
            content,
            author: user._id,
            createdAt: new Date()
        });
        await task.save();
        // Populate the new comment's author
        await task.populate('comments.author', 'name login avatarUrl');
        (0, responseHendler_1.successResponse)(res, "Comment added successfully", task, 200);
    }
    catch (err) {
        console.error("Error adding comment:", err);
        (0, responseHendler_1.errorResponse)(res, "Server error", 500, err);
    }
};
exports.addCommentController = addCommentController;
// Get task statistics for an organization
const getTaskStatsController = async (req, res) => {
    const githubId = req.githubId;
    const { organizationId } = req.params;
    try {
        const user = await users_model_1.User.findOne({ githubId });
        if (!user)
            return (0, responseHendler_1.errorResponse)(res, "User not found", 404);
        // Validate organization access
        const organization = await organisations_model_1.Organization.findOne({
            _id: organizationId,
            $or: [
                { owner: user._id },
                { members: user._id }
            ]
        });
        if (!organization) {
            return (0, responseHendler_1.errorResponse)(res, "Organization not found or access denied", 404);
        }
        const stats = await tasks_model_1.Task.aggregate([
            { $match: { organization: organization._id } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalEstimatedHours: { $sum: { $ifNull: ['$estimatedHours', 0] } },
                    totalActualHours: { $sum: { $ifNull: ['$actualHours', 0] } }
                }
            }
        ]);
        const priorityStats = await tasks_model_1.Task.aggregate([
            { $match: { organization: organization._id } },
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            }
        ]);
        const totalTasks = await tasks_model_1.Task.countDocuments({ organization: organization._id });
        const overdueTasks = await tasks_model_1.Task.countDocuments({
            organization: organization._id,
            dueDate: { $lt: new Date() },
            status: { $ne: 'done' }
        });
        const response = {
            statusBreakdown: stats,
            priorityBreakdown: priorityStats,
            totalTasks,
            overdueTasks
        };
        (0, responseHendler_1.successResponse)(res, "Task statistics fetched successfully", response, 200);
    }
    catch (err) {
        console.error("Error fetching task statistics:", err);
        (0, responseHendler_1.errorResponse)(res, "Server error", 500, err);
    }
};
exports.getTaskStatsController = getTaskStatsController;
