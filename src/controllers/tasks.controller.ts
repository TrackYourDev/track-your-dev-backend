import { Request, Response } from "express";
import { Task } from "../models/tasks.model";
import { User } from "../models/users.model";
import { Organization } from "../models/organisations.model";
import { Repository } from "../models/repositories.model";
import { successResponse, errorResponse } from "../utils/responseHendler";
import { IUser } from "../types/index.types";
import { Types } from "mongoose";

// Create a new task
export const createTaskController = async (req: Request, res: Response) => {
  const githubId = (req as any).githubId;
  
  try {
    const user = await User.findOne({ githubId }) as IUser;
    if (!user) return errorResponse(res, "User not found", 404);

    const { 
      title, 
      description, 
      status, 
      priority, 
      assigneeId, 
      dueDate, 
      organizationId, 
      repositoryId, 
      tags, 
      estimatedHours 
    } = req.body;

    // Validate organization access
    const organization = await Organization.findOne({ 
      _id: organizationId, 
      $or: [
        { owner: user._id },
        { members: user._id }
      ]
    });
    
    if (!organization) {
      return errorResponse(res, "Organization not found or access denied", 404);
    }

    // Validate assignee if provided
    let assignee = null;
    if (assigneeId) {
      assignee = await User.findById(assigneeId) as IUser;
      if (!assignee) {
        return errorResponse(res, "Assignee not found", 404);
      }
    }

    // Validate repository if provided
    let repository = null;
    if (repositoryId) {
      // Check if repositoryId is a MongoDB ObjectId or GitHub repo ID
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(repositoryId);
      
      if (isObjectId) {
        // If it's a MongoDB ObjectId, search by _id
        repository = await Repository.findOne({ 
          _id: repositoryId, 
          organization: organizationId 
        });
      } else {
        // If it's a GitHub repo ID, search by repoId
        repository = await Repository.findOne({ 
          repoId: parseInt(repositoryId), 
          organization: organizationId 
        });
      }
      
      if (!repository) {
        return errorResponse(res, "Repository not found", 404);
      }
    }

    const task = new Task({
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

    successResponse(res, "Task created successfully", task, 201);
  } catch (err) {
    console.error("Error creating task:", err);
    errorResponse(res, "Server error", 500, err);
  }
};

// Get all tasks for an organization
export const getTasksController = async (req: Request, res: Response) => {
  const githubId = (req as any).githubId;
  const { organizationId } = req.params;
  const { status, assignee, priority, repository } = req.query;
  
  try {
    const user = await User.findOne({ githubId }) as IUser;
    if (!user) return errorResponse(res, "User not found", 404);

    // Validate organization access
    const organization = await Organization.findOne({ 
      _id: organizationId, 
      $or: [
        { owner: user._id },
        { members: user._id }
      ]
    });
    
    if (!organization) {
      return errorResponse(res, "Organization not found or access denied", 404);
    }

    // Build query
    const query: any = { organization: organizationId };
    
    if (status) query.status = status;
    if (assignee) query.assignee = assignee;
    if (priority) query.priority = priority;
    if (repository) query.repository = repository;

    const tasks = await Task.find(query)
      .populate('assignee', 'name login avatarUrl')
      .populate('createdBy', 'name login avatarUrl')
      .populate('repository', 'name fullName')
      .sort({ createdAt: -1 });

    successResponse(res, "Tasks fetched successfully", tasks, 200);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    errorResponse(res, "Server error", 500, err);
  }
};

// Get a single task by ID
export const getTaskByIdController = async (req: Request, res: Response) => {
  const githubId = (req as any).githubId;
  const { taskId } = req.params;
  
  try {
    const user = await User.findOne({ githubId }) as IUser;
    if (!user) return errorResponse(res, "User not found", 404);

    const task = await Task.findById(taskId)
      .populate('assignee', 'name login avatarUrl')
      .populate('createdBy', 'name login avatarUrl')
      .populate('repository', 'name fullName')
      .populate('comments.author', 'name login avatarUrl');

    if (!task) {
      return errorResponse(res, "Task not found", 404);
    }

    // Check if user has access to the task's organization
    const organization = await Organization.findOne({ 
      _id: task.organization, 
      $or: [
        { owner: user._id },
        { members: user._id }
      ]
    });
    
    if (!organization) {
      return errorResponse(res, "Access denied", 403);
    }

    successResponse(res, "Task fetched successfully", task, 200);
  } catch (err) {
    console.error("Error fetching task:", err);
    errorResponse(res, "Server error", 500, err);
  }
};

// Update a task
export const updateTaskController = async (req: Request, res: Response) => {
  const githubId = (req as any).githubId;
  const { taskId } = req.params;
  
  try {
    const user = await User.findOne({ githubId }) as IUser;
    if (!user) return errorResponse(res, "User not found", 404);

    const task = await Task.findById(taskId);
    if (!task) {
      return errorResponse(res, "Task not found", 404);
    }

    // Check if user has access to the task's organization
    const organization = await Organization.findOne({ 
      _id: task.organization, 
      $or: [
        { owner: user._id },
        { members: user._id }
      ]
    });
    
    if (!organization) {
      return errorResponse(res, "Access denied", 403);
    }

    // Validate assignee if being updated
    if (req.body.assigneeId) {
      const assignee = await User.findById(req.body.assigneeId) as IUser;
      if (!assignee) {
        return errorResponse(res, "Assignee not found", 404);
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
        repository = await Repository.findOne({ 
          _id: req.body.repositoryId, 
          organization: task.organization 
        });
      } else {
        // If it's a GitHub repo ID, search by repoId
        repository = await Repository.findOne({ 
          repoId: parseInt(req.body.repositoryId), 
          organization: task.organization 
        });
      }
      
      if (!repository) {
        return errorResponse(res, "Repository not found", 404);
      }
      req.body.repository = repository._id;
      delete req.body.repositoryId;
    }

    // Convert dueDate string to Date if provided
    if (req.body.dueDate) {
      req.body.dueDate = new Date(req.body.dueDate);
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('assignee', 'name login avatarUrl')
    .populate('createdBy', 'name login avatarUrl')
    .populate('repository', 'name fullName');

    successResponse(res, "Task updated successfully", updatedTask, 200);
  } catch (err) {
    console.error("Error updating task:", err);
    errorResponse(res, "Server error", 500, err);
  }
};

// Delete a task
export const deleteTaskController = async (req: Request, res: Response) => {
  const githubId = (req as any).githubId;
  const { taskId } = req.params;
  
  try {
    const user = await User.findOne({ githubId }) as IUser;
    if (!user) return errorResponse(res, "User not found", 404);

    const task = await Task.findById(taskId);
    if (!task) {
      return errorResponse(res, "Task not found", 404);
    }

    // Check if user has access to the task's organization
    const organization = await Organization.findOne({ 
      _id: task.organization, 
      $or: [
        { owner: user._id },
        { members: user._id }
      ]
    });
    
    if (!organization) {
      return errorResponse(res, "Access denied", 403);
    }

    // Only task creator or organization owner can delete
    if (task.createdBy.toString() !== (user._id as Types.ObjectId).toString() && 
        organization.owner.toString() !== (user._id as Types.ObjectId).toString()) {
      return errorResponse(res, "Only task creator or organization owner can delete tasks", 403);
    }

    await Task.findByIdAndDelete(taskId);

    successResponse(res, "Task deleted successfully", null, 200);
  } catch (err) {
    console.error("Error deleting task:", err);
    errorResponse(res, "Server error", 500, err);
  }
};

// Add comment to a task
export const addCommentController = async (req: Request, res: Response) => {
  const githubId = (req as any).githubId;
  const { taskId } = req.params;
  const { content } = req.body;
  
  try {
    const user = await User.findOne({ githubId }) as IUser;
    if (!user) return errorResponse(res, "User not found", 404);

    const task = await Task.findById(taskId);
    if (!task) {
      return errorResponse(res, "Task not found", 404);
    }

    // Check if user has access to the task's organization
    const organization = await Organization.findOne({ 
      _id: task.organization, 
      $or: [
        { owner: user._id },
        { members: user._id }
      ]
    });
    
    if (!organization) {
      return errorResponse(res, "Access denied", 403);
    }

    // Initialize comments array if it doesn't exist
    if (!task.comments) {
      task.comments = [];
    }

    task.comments.push({
      content,
      author: user._id as Types.ObjectId,
      createdAt: new Date()
    });

    await task.save();

    // Populate the new comment's author
    await task.populate('comments.author', 'name login avatarUrl');

    successResponse(res, "Comment added successfully", task, 200);
  } catch (err) {
    console.error("Error adding comment:", err);
    errorResponse(res, "Server error", 500, err);
  }
};

// Get task statistics for an organization
export const getTaskStatsController = async (req: Request, res: Response) => {
  const githubId = (req as any).githubId;
  const { organizationId } = req.params;
  
  try {
    const user = await User.findOne({ githubId }) as IUser;
    if (!user) return errorResponse(res, "User not found", 404);

    // Validate organization access
    const organization = await Organization.findOne({ 
      _id: organizationId, 
      $or: [
        { owner: user._id },
        { members: user._id }
      ]
    });
    
    if (!organization) {
      return errorResponse(res, "Organization not found or access denied", 404);
    }

    const stats = await Task.aggregate([
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

    const priorityStats = await Task.aggregate([
      { $match: { organization: organization._id } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalTasks = await Task.countDocuments({ organization: organization._id });
    const overdueTasks = await Task.countDocuments({
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

    successResponse(res, "Task statistics fetched successfully", response, 200);
  } catch (err) {
    console.error("Error fetching task statistics:", err);
    errorResponse(res, "Server error", 500, err);
  }
}; 