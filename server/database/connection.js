import mongoose from 'mongoose';

const DB_Name = "solvit";

const connectDb = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Failed to connect to the database', error.message);
    process.exit(1);
  }
};

export default connectDb;
