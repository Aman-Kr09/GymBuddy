import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Gym from './models/Gym.js';
import Review from './models/Review.js';
import Message from './models/Message.js';
import Conversation from './models/Conversation.js';
import WorkoutSession from './models/WorkoutSession.js';

dotenv.config();

const clearData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ Error: MONGODB_URI is not defined in the environment variables.');
      process.exit(1);
    }
    
    // Hide credentials in log output
    const cleanUri = mongoUri.split('@')[1] || mongoUri;
    console.log(`Connecting to MongoDB at: ${cleanUri}`);
    await mongoose.connect(mongoUri);
    console.log('🔌 Connected successfully.');

    // Clear all collections
    const userResult = await User.deleteMany({});
    console.log(`🧹 Deleted ${userResult.deletedCount} Users.`);

    const gymResult = await Gym.deleteMany({});
    console.log(`🧹 Deleted ${gymResult.deletedCount} Gyms.`);

    const reviewResult = await Review.deleteMany({});
    console.log(`🧹 Deleted ${reviewResult.deletedCount} Reviews.`);

    const messageResult = await Message.deleteMany({});
    console.log(`🧹 Deleted ${messageResult.deletedCount} Messages.`);

    const conversationResult = await Conversation.deleteMany({});
    console.log(`🧹 Deleted ${conversationResult.deletedCount} Conversations.`);

    const sessionResult = await WorkoutSession.deleteMany({});
    console.log(`🧹 Deleted ${sessionResult.deletedCount} WorkoutSessions.`);

    console.log('\n🎉 Database cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
};

clearData();
