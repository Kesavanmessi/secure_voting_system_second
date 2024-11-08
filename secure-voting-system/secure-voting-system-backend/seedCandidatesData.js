// seedingCandidates.js
const mongoose = require('mongoose');

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

  // Define the Candidate schema with the 'listname' and 'candidates' array
  const candidateSchema = new mongoose.Schema({
    listname: { type: String, required: true },
    candidates: [
      {
        candidateId: { type: String, required: true },
        candidateName: { type: String, required: true },
        party: { type: String, required: true },
        electionDetails: {
          position: { type: String, required: true },
          manifesto: { type: String, required: true }
        }
      }
    ]
  });

  // Create the Candidate model
  const CandidateModel = mongoose.model('Candidate', candidateSchema);

  try {
    await CandidateModel.insertMany(candidates);
    console.log('Candidates inserted successfully');
  } catch (error) {
    console.error('Error inserting candidate data:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedCandidatesData();
