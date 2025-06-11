import { Schema, model } from "mongoose";

interface ICommitSummary {
  filename: string;
  summary: string;
}

interface ITask {
  title: string;
  description: string;
}

interface ICommitTasks {
  technicalTasks: ITask[];
  nonTechnicalTasks: ITask[];
}

interface ICommit {
  id: string;
  commitTime: Date;
  repository: Schema.Types.ObjectId;
  organization: Schema.Types.ObjectId;
  summaries: ICommitSummary[];
  tasks: ICommitTasks;
  commitMessage: string;
  additions: number;
  deletions: number;
  changes: number;
}

const CommitSummarySchema = new Schema<ICommitSummary>({
  filename: { type: String, required: true },
  summary: { type: String, required: true }
});

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String, required: true }
});

const CommitTasksSchema = new Schema<ICommitTasks>({
  technicalTasks: [TaskSchema],
  nonTechnicalTasks: [TaskSchema]
});

const CommitSchema = new Schema<ICommit>(
  {
    id: { type: String, required: true, unique: true },
    commitTime: { type: Date, required: true },
    repository: { type: Schema.Types.ObjectId, ref: 'Repository', required: true },
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    summaries: [CommitSummarySchema],
    tasks: {
      type: CommitTasksSchema,
      default: () => ({
        technicalTasks: [],
        nonTechnicalTasks: []
      })
    },
    commitMessage: { type: String, required: true },
    additions: { type: Number, required: true },
    deletions: { type: Number, required: true },
    changes: { type: Number, required: true }
  },
  { timestamps: true }
);

// Add compound index for repository and commitTime
CommitSchema.index({ repository: 1, commitTime: 1 });

// Add index for organization
CommitSchema.index({ organization: 1 });

export const Commit = model<ICommit>("Commit", CommitSchema);
