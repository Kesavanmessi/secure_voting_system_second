const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Admin = require('../models/Admin'); // Ensure paths are correct
const Election = require('../models/Election');
const bcrypt = require('bcrypt'); 

// Verify Election Name Endpoint
router.post('/elections/verify-name', async (req, res) => {
  const { electionName } = req.body;
  try {
    const existingElection = await Election.findOne({ electionName });
    res.json({ exists: !!existingElection });
  } catch (error) {
    res.status(500).json({ message: 'Server error verifying election name' });
  }
});

// Fetch Voter List Endpoint
router.post('/voters/list', async (req, res) => {
  const { voterListName } = req.body;
  try {
    const VoterList = mongoose.model(voterListName);
    const voters = await VoterList.find({}, { _id: 1 }); // Fetch voter IDs only
    res.json(voters);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching voters' });
  }
});

// Fetch Candidate List Endpoint
router.post('/candidates/list', async (req, res) => {
  const { candidateListName } = req.body;
  try {
    const CandidateList = mongoose.model(candidateListName);
    const candidates = await CandidateList.find({}, { _id: 1 }); // Fetch candidate IDs only
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching candidates' });
  }
});

// Create Election Endpoint
router.post('/elections/create', async (req, res) => {
  const { electionName, createdBy, voterListName, candidateListName, startTime, endTime } = req.body;

  try {
    // Validate start and end times
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      return res.status(400).json({ message: 'End time must be greater than start time' });
    }

    // Fetch voters from the specified voter collection
    const VoterList = mongoose.model(voterListName);
    const voters = await VoterList.find({}, { _id: 1 }); // Assuming voter IDs are stored

    // Fetch candidates from the specified candidate collection
    const CandidateList = mongoose.model(candidateListName);
    const candidates = await CandidateList.find({}, { _id: 1 }); // Assuming candidate IDs are stored

    // Create new election with fetched voter and candidate IDs
    const newElection = new Election({
      electionName,
      createdBy,
      voters: voters.map(voter => voter._id), // Extract voter IDs
      candidates: candidates.map(candidate => candidate._id), // Extract candidate IDs
      startTime: start,
      endTime: end,
      isResultPublished: false,
    });

    await newElection.save();
    res.json({ success: true, message: 'Election created successfully' });

  } catch (error) {
    console.error('Error creating election:', error);
    res.status(500).json({ message: 'Error creating election' });
  }
});

module.exports = router;
