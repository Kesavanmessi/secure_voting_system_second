const mongoose = require('mongoose');
const Election = require('./models/Election');

// Replace with your MongoDB connection URI
const uri = 'mongodb://localhost:27017/secureVotingDB';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected for Election'))
  .catch(err => console.error('MongoDB connection error for Election:', err));

const seedElectionData = async () => {
  const elections = [
    {
      electionName: "General Election 2024",
      createdBy: "kesavan",
      approvedBy:"kesavan",
      voterLists: ["General Election 2024","Election 2024"],  // Voter list names
      candidateLists: ["General Election 2024" , "Election 2024"],  // Candidate list names
      startTime: new Date("2024-11-26T11:45:00"),
      endTime: new Date("2024-11-26T11:50:00"),
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
