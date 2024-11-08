// seedingVoters.js
const mongoose = require('mongoose');

// Replace with your MongoDB connection URI
const uri = 'mongodb://localhost:27017/collectionsListForVoters';

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
          password: 'password123',
          address: '123 Main St',
          age: 30
        },
        {
          voterId: 'voter456',
          voterName: 'Jane Smith',
          password: 'password456',
          address: '456 Oak Ave',
          age: 25
        },
        {
          voterId: 'voter789',
          voterName: 'David Johnson',
          password: 'password789',
          address: '789 Pine Rd',
          age: 45
        }
      ]
    }
  ];

  // Define the Voter schema with the 'listname' and 'voters' array
  const voterSchema = new mongoose.Schema({
    listname: { type: String, required: true },
    voters: [
      {
        voterId: { type: String, required: true },
        voterName: { type: String, required: true },
        password: { type: String, required: true },
        address: { type: String, required: true },
        age: { type: Number, required: true }
      }
    ]
  });

  // Create the Voter model
  const VoterModel = mongoose.model('Voter', voterSchema);

  try {
    await VoterModel.insertMany(voters);
    console.log('Voters inserted successfully');
  } catch (error) {
    console.error('Error inserting voter data:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedVotersData();
