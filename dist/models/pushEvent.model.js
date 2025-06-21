"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushEvent = void 0;
const mongoose_1 = require("mongoose");
const PushEventSchema = new mongoose_1.Schema({
    repository: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Repository",
        required: true,
    },
    organization: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
    },
    pusher: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    beforeSha: { type: String, required: true },
    afterSha: { type: String, required: true },
    created: { type: Boolean, required: true },
    deleted: { type: Boolean, required: true },
    forced: { type: Boolean, required: true },
    compareUrl: { type: String, required: true },
    commits: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Commit" }],
    pushedAt: { type: Date, required: true },
}, { timestamps: true });
exports.PushEvent = (0, mongoose_1.model)("PushEvent", PushEventSchema);
