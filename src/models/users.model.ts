import mongoose, { Schema } from "mongoose";
import { IUser } from "../types/index.types";

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String },
    avatar_url: { type: String },
    profile_url: { type: String },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>("User", UserSchema);
