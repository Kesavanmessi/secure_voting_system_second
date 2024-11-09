const mongoose = require('mongoose');
const Voter = require('./models/Voters'); // Adjust the path as needed

// Replace with your MongoDB connection URI
const uri = 'mongodb://localhost:27017/secureVotingDB';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected for Voters'))
  .catch(err => console.error('MongoDB connection error for Voters:', err));

const seedVotersData = async () => {
  const voters = [
    {
      listname: "General Election 2024",
      voters: [
        {
          voterId: 'voter123',
          voterName: 'John Doe',
          password: 'password123', // Store passwords securely in a real project
          address: '123 Main St',
          age: 30
        },
        {
          voterId: 'voter456',
          voterName: 'Jane Smith',
          password: 'password456', // Store passwords securely in a real project
          address: '456 Oak Ave',
          age: 25
        },
        {
          voterId: 'voter789',
          voterName: 'David Johnson',
          password: 'password789', // Store passwords securely in a real project
          address: '789 Pine Rd',
          age: 45
        }
      ]
    }
  ];

  try {
    await Voter.insertMany(voters);
    console.log('Voters inserted successfully');
  } catch (error) {
    console.error('Error inserting voter data:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedVotersData();
