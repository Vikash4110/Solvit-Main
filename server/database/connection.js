import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

const DB_Name = 'solvit';

const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`, {
      maxPoolSize: 50,              // Up to 50 parallel DB operations
      minPoolSize: 10,              // 10 warm connections ready
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
    logger.info(`Database connected successfully to host: ${connectionInstance.connection.host}`);
  } catch (error) {
    logger.error('Failed to connect to the database:', error);
    process.exit(1);
  }
};

export default connectDb;
