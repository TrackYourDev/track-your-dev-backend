import { Schema, model } from "mongoose";
import { ICommit, IPushEvent } from "../types/index.types";

const CommitSchema = new Schema<ICommit>({
  sha: { type: String, required: true },
  message: { type: String, required: true },
  author: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
  },
  committer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
  },
  timestamp: { type: Date, required: true },
  treeId: { type: String, required: true },
  distinct: { type: Boolean, required: true },
  fileChanges: [
    {
      filePath: { type: String, required: true },
      changeType: {
        type: String,
        enum: ["added", "removed", "modified"],
        required: true,
      },
    },
  ],
});

const PushEventSchema = new Schema<IPushEvent>(
  {
    repository: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },
    pusher: { type: Schema.Types.ObjectId, ref: "User", required: true },
    beforeSha: { type: String, required: true },
    afterSha: { type: String, required: true },
    created: { type: Boolean, required: true },
    deleted: { type: Boolean, required: true },
    forced: { type: Boolean, required: true },
    compareUrl: { type: String, required: true },
    commits: [CommitSchema],
    pushedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const PushEvent = model<IPushEvent>("PushEvent", PushEventSchema);
