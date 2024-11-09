const mongoose = require('mongoose');
const Election = require('./models/Election'); // Adjust the path if needed

// Replace with your MongoDB connection URI
const uri = 'mongodb://localhost:27017/secureVotingDB';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected for Election'))
  .catch(err => console.error('MongoDB connection error for Election:', err));

const seedElectionData = async () => {
  const elections = [
    {
      electionName: "General Election 2024",
      createdBy: "admin1",
      voters: "General Election 2024", // Replace with actual voter IDs from your Voter collection
      candidates: "General Election 2024", // Replace with actual candidate IDs from your Candidate collection
      startTime: new Date("2024-10-01T08:00:00"),
      endTime: new Date("2024-10-02T20:00:00"),
      isResultPublished: false
    }
  ];

  try {
    await Election.insertMany(elections);
    console.log('Elections inserted successfully');
  } catch (error) {
    console.error('Error inserting election data:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedElectionData();
