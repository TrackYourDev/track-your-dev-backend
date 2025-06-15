import { updateExpiredSubscriptions } from './services/subscription.service';

// Run the subscription update task every hour
const SUBSCRIPTION_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

export const startScheduler = () => {
  // Run immediately on startup
  updateExpiredSubscriptions().catch(console.error);

  // Then run every hour
  setInterval(() => {
    updateExpiredSubscriptions().catch(console.error);
  }, SUBSCRIPTION_CHECK_INTERVAL);

  console.log('Subscription scheduler started');
}; 