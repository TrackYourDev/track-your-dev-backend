import { User } from "../models/users.model";

export const updateExpiredSubscriptions = async () => {
  try {
    const now = new Date();
    
    // Find all users whose subscription has expired and is still marked as subscribed
    const result = await User.updateMany(
      {
        isSubscribed: true,
        subscriptionExpiresAt: { $lt: now }
      },
      {
        $set: { isSubscribed: false }
      }
    );

    console.log(`Updated ${result.modifiedCount} expired subscriptions`);
    return result;
  } catch (error) {
    console.error('Error updating expired subscriptions:', error);
    throw error;
  }
}; 