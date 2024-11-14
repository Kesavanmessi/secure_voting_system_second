const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Admin = require('../models/Admin'); // Ensure paths are correct
const Election = require('../models/Election');
const PendingElection = require('../models/PendingElection')
const PendingElectionForModifications = require('../models/PendingElectionForModifications')
const Voter = require('../models/Voters');
const Candidate = require('../models/Candidates');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { verifyAdminRole } = require('../middleware/authMiddleware'); 


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
  const { electionName, createdBy, voterListName, candidateListName, startTime, endTime ,approvedBy } = req.body;

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
      approvedBy,
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


// GET: Fetch elections based on role
router.get('/fetching', async (req, res) => {
  const { createdBy } = req.query; // createdBy is included only for non-head admins

  try {
    let elections;

    if (createdBy) {
      // If createdBy is specified, fetch elections created by this admin only
      elections = await Election.find({ createdBy });
    } else {
      // If no createdBy is specified, fetch all elections (for Head Admin)
      elections = await Election.find({});
    }

    res.status(200).json(elections);
  } catch (error) {
    console.error('Error fetching elections:', error);
    res.status(500).json({ success: false, message: 'Error fetching elections' });
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


// POST /api/elections/submit - Submit election for approval
router.post('/pending',  async (req, res) => {
  const { electionName, createdBy, voterLists, candidateLists, startTime, endTime } = req.body;

  try {
    const pendingElection = new PendingElection({
      electionName,
      createdBy,
      voterLists,
      candidateLists,
      startTime,
      endTime
    });
    await pendingElection.save();
    res.status(201).json({ success: true, message: 'Election submitted for approval', pendingElection });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error submitting election', error: error.message });
  }
});

// PUT /api/elections/approve/:id - Approve a pending election
router.put('/approve/:id', async (req, res) => {
  try {
    const pendingElection = await PendingElection.findById(req.params.id);
    if (!pendingElection) {
      return res.status(404).json({ success: false, message: 'Pending election not found' });
    }

    // Move to Elections collection
    const approvedElection = new Election({
      ...pendingElection.toObject(),
      approvedBy: req.body.name // Assumes admin's name is accessible in req
    });
    await approvedElection.save();
    
    // Remove from PendingElections collection using deleteOne
    await PendingElection.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, message: 'Election approved successfully', approvedElection });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error approving election', error: error.message });
  }
});

// POST /api/elections/request-modification - Request modifications for an election
router.post('/request-modification', async (req, res) => {
  const { electionId, updatedFields, modifiedBy } = req.body;

  try {
    // Use findOneAndUpdate with upsert option
    const modifiedElection = await PendingElectionForModifications.findOneAndUpdate(
      { originalElectionId: electionId }, // Filter by election ID
      {
        updatedFields,
        modifiedBy,
      },
      {
        new: true,      // Return the updated document
        upsert: true,   // Insert a new document if no matching document is found
      }
    );

    res.status(201).json({ success: true, message: 'Modification request submitted', modifiedElection });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error requesting modification', error: error.message });
  }
});

// PUT /api/elections/approve-modification/:id - Approve election modification
router.put('/approve-modification/:id',  async (req, res) => {
  try {
    const pendingModification = await PendingElectionForModifications.findById(req.params.id);
    if (!pendingModification) {
      return res.status(404).json({ success: false, message: 'Pending modification not found' });
    }

    const { originalElectionId, updatedFields } = pendingModification;
    const updatedElection = await Election.findByIdAndUpdate(originalElectionId, updatedFields, { new: true });

    if (!updatedElection) {
      return res.status(404).json({ success: false, message: 'Original election not found' });
    }

    await PendingElectionForModifications.findByIdAndDelete(req.params.id); // Remove pending modification after approval
    res.status(200).json({ success: true, message: 'Modification approved and applied', updatedElection });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error approving modification', error: error.message });
  }
});



module.exports = router;
