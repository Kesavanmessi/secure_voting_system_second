const mongoose = require('mongoose');
require('dotenv').config();  // Load environment variables

const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI from .env
    await mongoose.connect(process.env.MONGODB_URI, {
      connectTimeoutMS: 10000  // Optional: Set a timeout for connection
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);  // Exit process with failure
  }
};

module.exports = connectDB;
