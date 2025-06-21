"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinWaitlist = void 0;
const waitlist_model_1 = __importDefault(require("../models/waitlist.model"));
const responseHendler_1 = require("../utils/responseHendler");
const mailer_1 = require("../utils/mailer");
const joinWaitlist = async (req, res) => {
    const { email } = req.body;
    if (!email)
        return (0, responseHendler_1.errorResponse)(res, 'Email is required', 400);
    try {
        const exists = await waitlist_model_1.default.findOne({ email });
        if (exists)
            return (0, responseHendler_1.errorResponse)(res, 'Email already exists in the waitlist', 400);
        const waitlistEntry = await waitlist_model_1.default.create({ email });
        await (0, mailer_1.sendWaitlistEmail)(email);
        return (0, responseHendler_1.successResponse)(res, 'Successfully joined the waitlist', waitlistEntry, 201);
    }
    catch (err) {
        console.error('Waitlist error:', err);
        return (0, responseHendler_1.errorResponse)(res, 'Failed to join the waitlist', 500, err);
    }
};
exports.joinWaitlist = joinWaitlist;
