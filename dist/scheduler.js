"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startScheduler = void 0;
const subscription_service_1 = require("./services/subscription.service");
// Run the subscription update task every hour
const SUBSCRIPTION_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds
const startScheduler = () => {
    // Run immediately on startup
    (0, subscription_service_1.updateExpiredSubscriptions)().catch(console.error);
    // Then run every hour
    setInterval(() => {
        (0, subscription_service_1.updateExpiredSubscriptions)().catch(console.error);
    }, SUBSCRIPTION_CHECK_INTERVAL);
    console.log('Subscription scheduler started');
};
exports.startScheduler = startScheduler;
