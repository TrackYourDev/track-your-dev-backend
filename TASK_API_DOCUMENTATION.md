# Task Management API Documentation

This document describes the REST API endpoints for managing tasks in the task board system.

## Base URL
```
/api/tasks
```

## Authentication
All endpoints require authentication via JWT token in the request headers or cookies.

## Endpoints

### 1. Create Task
**POST** `/api/tasks`

Creates a new task in the specified organization.

**Request Body:**
```json
{
  "title": "Implement user authentication",
  "description": "Add login and registration functionality with JWT tokens",
  "status": "todo",
  "priority": "high",
  "assigneeId": "507f1f77bcf86cd799439011",
  "dueDate": "2024-02-15",
  "organizationId": "507f1f77bcf86cd799439012",
  "repositoryId": "386711232",
  "tags": ["frontend", "auth"],
  "estimatedHours": 8
}
```

**Note:** The `repositoryId` field can be either:
- A MongoDB ObjectId (24-character hex string) - if you have the database ID
- A GitHub repository ID (numeric) - if you're passing the GitHub repo ID directly

**Response:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "title": "Implement user authentication",
    "description": "Add login and registration functionality with JWT tokens",
    "status": "todo",
    "priority": "high",
    "assignee": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "login": "johndoe",
      "avatarUrl": "https://github.com/johndoe.png"
    },
    "createdBy": {
      "_id": "507f1f77bcf86cd799439015",
      "name": "Jane Smith",
      "login": "janesmith",
      "avatarUrl": "https://github.com/janesmith.png"
    },
    "organization": "507f1f77bcf86cd799439012",
    "repository": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "my-app",
      "fullName": "org/my-app"
    },
    "dueDate": "2024-02-15T00:00:00.000Z",
    "tags": ["frontend", "auth"],
    "estimatedHours": 8,
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-20T10:30:00.000Z"
  }
}
```

### 2. Get Tasks by Organization
**GET** `/api/tasks/organization/:organizationId`

Retrieves all tasks for a specific organization with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by status (`todo`, `in-progress`, `done`)
- `assignee` (optional): Filter by assignee user ID
- `priority` (optional): Filter by priority (`low`, `medium`, `high`)
- `repository` (optional): Filter by repository ID

**Example:**
```
GET /api/tasks/organization/507f1f77bcf86cd799439012?status=todo&priority=high
```

**Response:**
```json
{
  "success": true,
  "message": "Tasks fetched successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "title": "Implement user authentication",
      "description": "Add login and registration functionality with JWT tokens",
      "status": "todo",
      "priority": "high",
      "assignee": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "login": "johndoe",
        "avatarUrl": "https://github.com/johndoe.png"
      },
      "createdBy": {
        "_id": "507f1f77bcf86cd799439015",
        "name": "Jane Smith",
        "login": "janesmith",
        "avatarUrl": "https://github.com/janesmith.png"
      },
      "dueDate": "2024-02-15T00:00:00.000Z",
      "tags": ["frontend", "auth"],
      "estimatedHours": 8,
      "createdAt": "2024-01-20T10:30:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z"
    }
  ]
}
```

### 3. Get Task by ID
**GET** `/api/tasks/:taskId`

Retrieves a specific task by its ID.

**Response:**
```json
{
  "success": true,
  "message": "Task fetched successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "title": "Implement user authentication",
    "description": "Add login and registration functionality with JWT tokens",
    "status": "todo",
    "priority": "high",
    "assignee": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "login": "johndoe",
      "avatarUrl": "https://github.com/johndoe.png"
    },
    "createdBy": {
      "_id": "507f1f77bcf86cd799439015",
      "name": "Jane Smith",
      "login": "janesmith",
      "avatarUrl": "https://github.com/janesmith.png"
    },
    "organization": "507f1f77bcf86cd799439012",
    "repository": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "my-app",
      "fullName": "org/my-app"
    },
    "dueDate": "2024-02-15T00:00:00.000Z",
    "tags": ["frontend", "auth"],
    "estimatedHours": 8,
    "actualHours": 6,
    "comments": [
      {
        "content": "Started working on this task",
        "author": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "John Doe",
          "login": "johndoe",
          "avatarUrl": "https://github.com/johndoe.png"
        },
        "createdAt": "2024-01-21T09:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-21T09:00:00.000Z"
  }
}
```

### 4. Update Task
**PUT** `/api/tasks/:taskId`

Updates an existing task.

**Request Body:**
```json
{
  "title": "Implement user authentication with OAuth",
  "description": "Add login and registration functionality with JWT tokens and OAuth support",
  "status": "in-progress",
  "priority": "high",
  "assigneeId": "507f1f77bcf86cd799439011",
  "dueDate": "2024-02-20",
  "repositoryId": "386711232",
  "tags": ["frontend", "auth", "oauth"],
  "estimatedHours": 12,
  "actualHours": 6
}
```

**Note:** The `repositoryId` field can be either:
- A MongoDB ObjectId (24-character hex string) - if you have the database ID
- A GitHub repository ID (numeric) - if you're passing the GitHub repo ID directly

**Response:**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "title": "Implement user authentication with OAuth",
    "description": "Add login and registration functionality with JWT tokens and OAuth support",
    "status": "in-progress",
    "priority": "high",
    "assignee": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "login": "johndoe",
      "avatarUrl": "https://github.com/johndoe.png"
    },
    "createdBy": {
      "_id": "507f1f77bcf86cd799439015",
      "name": "Jane Smith",
      "login": "janesmith",
      "avatarUrl": "https://github.com/janesmith.png"
    },
    "organization": "507f1f77bcf86cd799439012",
    "repository": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "my-app",
      "fullName": "org/my-app"
    },
    "dueDate": "2024-02-20T00:00:00.000Z",
    "tags": ["frontend", "auth", "oauth"],
    "estimatedHours": 12,
    "actualHours": 6,
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-21T15:00:00.000Z"
  }
}
```

### 5. Delete Task
**DELETE** `/api/tasks/:taskId`

Deletes a task. Only the task creator or organization owner can delete tasks.

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": null
}
```

### 6. Add Comment to Task
**POST** `/api/tasks/:taskId/comments`

Adds a comment to a specific task.

**Request Body:**
```json
{
  "content": "Started working on this task. Will complete the OAuth integration by tomorrow."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "title": "Implement user authentication with OAuth",
    "comments": [
      {
        "content": "Started working on this task. Will complete the OAuth integration by tomorrow.",
        "author": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "John Doe",
          "login": "johndoe",
          "avatarUrl": "https://github.com/johndoe.png"
        },
        "createdAt": "2024-01-21T16:00:00.000Z"
      }
    ]
  }
}
```

### 7. Get Task Statistics
**GET** `/api/tasks/stats/:organizationId`

Retrieves task statistics for an organization.

**Response:**
```json
{
  "success": true,
  "message": "Task statistics fetched successfully",
  "data": {
    "statusBreakdown": [
      {
        "_id": "todo",
        "count": 5,
        "totalEstimatedHours": 40,
        "totalActualHours": 0
      },
      {
        "_id": "in-progress",
        "count": 3,
        "totalEstimatedHours": 24,
        "totalActualHours": 12
      },
      {
        "_id": "done",
        "count": 8,
        "totalEstimatedHours": 64,
        "totalActualHours": 58
      }
    ],
    "priorityBreakdown": [
      {
        "_id": "high",
        "count": 4
      },
      {
        "_id": "medium",
        "count": 8
      },
      {
        "_id": "low",
        "count": 4
      }
    ],
    "totalTasks": 16,
    "overdueTasks": 2
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "errors": "Additional error details (optional)"
}
```

### Common Error Codes:
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (access denied)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Data Models

### Task Status
- `todo` - Task is pending
- `in-progress` - Task is being worked on
- `done` - Task is completed

### Task Priority
- `low` - Low priority task
- `medium` - Medium priority task
- `high` - High priority task

## Frontend Integration

To integrate with your React frontend, you can use these endpoints to:

1. **Load tasks for a board**: Use `GET /api/tasks/organization/:organizationId` to fetch all tasks
2. **Create new tasks**: Use `POST /api/tasks` when adding tasks to columns
3. **Update task status**: Use `PUT /api/tasks/:taskId` when dragging tasks between columns
4. **Delete tasks**: Use `DELETE /api/tasks/:taskId` for the delete functionality
5. **Add comments**: Use `POST /api/tasks/:taskId/comments` for task discussions
6. **Get statistics**: Use `GET /api/tasks/stats/:organizationId` for dashboard metrics

## Security Features

- All endpoints require authentication
- Users can only access tasks from organizations they belong to
- Only task creators or organization owners can delete tasks
- All user inputs are validated and sanitized
- Database queries are protected against injection attacks 