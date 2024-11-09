const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Admin = require('../models/Admin'); // Ensure paths are correct
const Election = require('../models/Election');
const Voter = require('../models/Voters');
const Candidate = require('../models/Candidates');
const bcrypt = require('bcrypt'); 

// Verify Election Name Endpoint
router.post('/verify-name', async (req, res) => {
  const { electionName } = req.body;

  try {
    // Search for an election with the given name
    const existingElection = await Election.findOne({ electionName });

    // Respond with whether the election name exists
    res.json({ exists: !!existingElection });  // true if exists, false if not
  } catch (error) {
    console.error('Error verifying election name:', error);
    res.status(500).json({ message: 'Server error verifying election name' });
  }
});

router.post('/voters/check-list', async (req, res) => {
  const { voterListName } = req.body;

  try {
    // Check for a voter list with the specified list name in the collectionsListForVoters database
    const voterListExists = await Voter.findOne({ listname: voterListName });

    // Respond with whether the voter list exists
    if (voterListExists) {
      res.json({ exists: true, message: `Voter list "${voterListName}" found.` });
    } else {
      res.json({ exists: false, message: `No voter list found with the name "${voterListName}".` });
    }
  } catch (error) {
    console.error('Error verifying voter list:', error);
    res.status(500).json({ message: 'Server error verifying voter list' });
  }
});


router.post('/candidates/check-list', async (req, res) => {
  const { candidateListName } = req.body;

  try {
    // Check for a candidate list with the specified list name in the collectionsListForCandidates database
    const candidateListExists = await Candidate.findOne({ listname: candidateListName });

    // Respond with whether the candidate list exists
    if (candidateListExists) {
      res.json({ exists: true, message: `Candidate list "${candidateListName}" found.` });
    } else {
      res.json({ exists: false, message: `No candidate list found with the name "${candidateListName}".` });
    }
  } catch (error) {
    console.error('Error verifying candidate list:', error);
    res.status(500).json({ message: 'Server error verifying candidate list' });
  }
});


// Endpoint to create an election
router.post('/create', async (req, res) => {
  const { electionName, createdBy, voterListName, candidateListName, startTime, endTime } = req.body;

  try {
    // Check if the election name already exists
    const existingElection = await Election.findOne({ electionName });
    if (existingElection) {
      return res.status(400).json({ message: `Election "${electionName}" already exists.` });
    }

    // Verify start and end times
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      return res.status(400).json({ message: 'End time must be greater than start time.' });
    }

    // Create a new election document
    const newElection = new Election({
      electionName,
      createdBy,
      voters: voterListName,
      candidates: candidateListName,
      startTime: start,
      endTime: end,
      isResultPublished: false,
    });

    await newElection.save();
    res.json({ success: true, message: `Election "${electionName}" created successfully.` });
  } catch (error) {
    console.error('Error creating election:', error);
    res.status(500).json({ message: 'Error creating election' });
  }
});

module.exports = router;
