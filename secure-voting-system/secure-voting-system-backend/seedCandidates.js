const mongoose = require('mongoose');
const Candidate = require('./models/Candidates'); // Adjust the path as needed

// Replace with your MongoDB connection URI
const uri = 'mongodb://localhost:27017/collectionsListForCandidates';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected for Candidates'))
  .catch(err => console.error('MongoDB connection error for Candidates:', err));

const seedCandidatesData = async () => {
  const candidates = [
    {
      listname: "General Election 2024",
      candidates: [
        {
          candidateId: 'C12345',
          candidateName: 'Alice Johnson',
          party: 'Party A',
          electionDetails: {
            position: 'President',
            manifesto: 'Manifesto details here'
          }
        },
        {
          candidateId: 'C12346',
          candidateName: 'Bob Brown',
          party: 'Party B',
          electionDetails: {
            position: 'Vice President',
            manifesto: 'Manifesto details here'
          }
        }
      ]
    }
  ];

  try {
    await Candidate.insertMany(candidates);
    console.log('Candidates inserted successfully');
  } catch (error) {
    console.error('Error inserting candidate data:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedCandidatesData();
