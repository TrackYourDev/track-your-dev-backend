"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExpiredSubscriptions = void 0;
const users_model_1 = require("../models/users.model");
const updateExpiredSubscriptions = async () => {
    try {
        const now = new Date();
        // Find all users whose subscription has expired and is still marked as subscribed
        const result = await users_model_1.User.updateMany({
            isSubscribed: true,
            subscriptionExpiresAt: { $lt: now }
        }, {
            $set: { isSubscribed: false }
        });
        console.log(`Updated ${result.modifiedCount} expired subscriptions`);
        return result;
    }
    catch (error) {
        console.error('Error updating expired subscriptions:', error);
        throw error;
    }
};
exports.updateExpiredSubscriptions = updateExpiredSubscriptions;
