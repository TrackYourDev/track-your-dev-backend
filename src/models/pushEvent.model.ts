import { Schema, model } from "mongoose";
import { IPushEvent } from "../types/index.types";

const PushEventSchema = new Schema<IPushEvent>(
  {
    repository: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    pusher: { type: Schema.Types.ObjectId, ref: "User", required: true },
    beforeSha: { type: String, required: true },
    afterSha: { type: String, required: true },
    created: { type: Boolean, required: true },
    deleted: { type: Boolean, required: true },
    forced: { type: Boolean, required: true },
    compareUrl: { type: String, required: true },
    commits: [{ type: Schema.Types.ObjectId, ref: "Commit" }],
    pushedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const PushEvent = model<IPushEvent>("PushEvent", PushEventSchema);
