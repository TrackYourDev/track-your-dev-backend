import mongoose, { Schema } from "mongoose";
import { ICommit } from "../types/index.types.js";

const CommitSchema: Schema = new Schema(
  {
    sha: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, required: true },
    url: { type: String, required: true },

    files: {
      added: [String],
      removed: [String],
      modified: [String],
    },

    repository: {
      id: Number,
      full_name: String,
      private: Boolean,
      html_url: String,
    },

    author: {
      username: String,
      name: String,
      email: String,
    },

    pusher: {
      name: String,
      email: String,
    },

    sender: {
      login: String,
      avatar_url: String,
      profile_url: String,
    },

    organization: {
      login: String,
      avatar_url: String,
      url: String,
    },

    summary: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Commit = mongoose.model<ICommit>("Commit", CommitSchema);
