const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Use MongoDB Atlas URI if available, otherwise fall back to local MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/secureVotingDB';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const isAtlas = mongoURI.includes('mongodb+srv');
    const connectionType = isAtlas ? 'MongoDB Atlas' : 'Local MongoDB';
    
    console.log(`${connectionType} Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
