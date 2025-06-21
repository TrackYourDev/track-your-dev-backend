"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    githubId: { type: Number, required: true, unique: true },
    login: { type: String, required: true },
    name: String,
    email: String,
    avatarUrl: String,
    profileUrl: String,
    isSubscribed: { type: Boolean, default: false },
    subscriptionExpiresAt: { type: Date }
});
exports.User = (0, mongoose_1.model)('User', UserSchema);
