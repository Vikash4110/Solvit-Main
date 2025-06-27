// utils/db.js
const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Failed to connect to the database', error);
        process.exit(1);
    }
};

module.exports = connectDb;
