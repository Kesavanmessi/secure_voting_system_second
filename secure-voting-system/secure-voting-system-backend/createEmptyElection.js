// createEmptyElection.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Election = require('./models/Election');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Database connected'))
  .catch(err => console.log('Database connection error:', err));

// Function to create an empty election
const createEmptyElection = async () => {
    try {
      const newElection = new Election({
        "electionName": "Presidential Election 2024",
        "createdBy": "64cfeac9a8e5e3d51234bcde",
        "voters": [
          "voterID123",
          "voterID456",
          "voterID789"
        ],
        "candidates": [
          "candidateA",
          "candidateB",
          "candidateC"
        ],
        "startTime": "2024-10-01T08:00:00Z",
        "endTime": "2024-10-02T20:00:00Z",
        "isResultPublished": false,
        "createdAt": "2024-09-20T10:00:00Z",
        "updatedAt": "2024-09-20T10:00:00Z"
      }
      
      );
      await newElection.save();
      console.log('Empty election document created');
    } catch (error) {
      console.error('Error creating election:', error);
    } finally {
      mongoose.connection.close();
    }
  };
  

// Run the function
createEmptyElection();
