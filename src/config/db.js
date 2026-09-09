import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/event-vibe';
    const conn = await mongoose.connect(mongoURI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Optional: Log when connection drops
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB Disconnected');
    });

    // Handle app shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🛑 MongoDB connection closed via app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    // Don't kill process immediately in dev mode if mongo isn't running locally, or log error
  }
};

export default connectDB;