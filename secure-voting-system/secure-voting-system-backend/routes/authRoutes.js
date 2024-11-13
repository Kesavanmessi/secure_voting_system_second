const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Admin = require('../models/Admin'); // Ensure paths are correct
const Election = require('../models/Election');
const Voter = require('../models/Voters');
const Candidate = require('../models/Candidates');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');
require('dotenv').config();


// POST /api/auth/admin-login
router.post('/admin-login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Find admin by username
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(200).json({ success: false, message: 'Admin not found' });
    }
    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(200).json({ success: false, message: 'Invalid password' });
    }

    // Create a JWT token containing admin info, role, and permissions
    const token = jwt.sign(
      {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        permissions: admin.permissions,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }  // Token expires in 1 hour
    );

    // Send the token and admin details as response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        username: admin.username,
        role: admin.role,
        permissions: admin.permissions,
      }
    });
  } catch (error) {
    console.error('Error logging in admin:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

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


router.get('/fetching', async (req, res) => {
  try {
    const elections = await Election.find({}, 'electionName'); // Only fetch the 'electionName' field
    res.json(elections);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching election names' });
  }
});

router.delete('/trash', async (req, res) => {
  try {
    const { id } = req.query;
    await Election.findByIdAndDelete(id);
    res.status(200).json({ message: 'Election deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting election' });
  }
});

// Get election details by ID
router.get('/:id', async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    res.json(election);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching election details' });
  }
});

// Update election details by ID
router.put('/:id', async (req, res) => {
  const { electionName, startTime, endTime, voters, candidates } = req.body;

  try {
    const updatedElection = await Election.findByIdAndUpdate(
      req.params.id,
      { electionName, startTime, endTime, voterLists : voters, candidateLists : candidates },
      { new: true, runValidators: true }
    );

    if (!updatedElection) {
      return res.status(404).json({ message: 'Election not found' });
    }

    res.json({ success: true, message: 'Election updated successfully', updatedElection });
  } catch (error) {
    res.status(500).json({ message: 'Error updating election' });
  }
});

//deleting particlar voter list or candidate list from election

// Delete list entry from election
router.delete('/:id/list', async (req, res) => {
  const { listName, listType } = req.body;

  try {
    const updateQuery = listType === 'voterLists'
      ? { $pull: { voterLists: listName } }
      : { $pull: { candidateLists: listName } };

    const updatedElection = await Election.findByIdAndUpdate(req.params.id, updateQuery, { new: true });

    if (!updatedElection) {
      return res.status(404).json({ message: 'Election not found' });
    }

    res.json({ success: true, message: `${listType} entry removed successfully`, updatedElection });
  } catch (error) {
    res.status(500).json({ message: 'Error removing entry from election' });
  }
});


// Endpoint to check if a voter exists in the Voter collection
router.get('/searchvoterLists/:voterName', async (req, res) => {
  const { voterName } = req.params;

  try {
    // Search for the voter in the Voter collection by listname
    const voter = await Voter.findOne({ listname: voterName });

    // Check if voter was found
    if (voter) {
      return res.status(200).json({
        message: `Voter "${voterName}" found in the Voter collection.`,
        exists: true,
        voter
      });
    } else {
      return res.status(200).json({
        message: `Voter "${voterName}" not found in the Voter collection.`,
        exists: false
      });
    }
  } catch (error) {
    console.error('Error searching for voter:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
});


router.get('/searchCandidateLists/:candidateName', async (req, res) => {
  const { candidateName } = req.params;

  try {
    // Search for the candidate in the Candidate collection
    const candidate = await Candidate.findOne({ listname: candidateName });
    if (candidate) {
      return res.status(200).json({
        message: `Candidate "${candidateName}" found in the Candidate collection.`,
        exists: true,
        candidate
      });
    } else {
      return res.status(200).json({
        message: `Candidate "${candidateName}" not found in the Candidate collection.`,
        exists: false
      });
    }
  } catch (error) {
    console.error('Error searching for candidate:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
});


module.exports = router;
