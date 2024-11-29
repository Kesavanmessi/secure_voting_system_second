const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const ElectionEnded = require('../models/ElectionEnded');
const Admin = require('../models/Admin'); // Ensure paths are correct
const Election = require('../models/Election');
const PendingElection = require('../models/PendingElection')
const PendingElectionForModifications = require('../models/PendingElectionForModifications')
const Voter = require('../models/Voters');
const Candidate = require('../models/Candidates');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const cron = require('node-cron');
require('dotenv').config();
const { verifyAdminRole } = require('../middleware/authMiddleware'); 
const ElectionCandidates = require('../models/ElectionCandidates'); // Collection for candidates
const ElectionVoters = require('../models/ElectionVoters'); // Collection to track voters in elections
const VoteLog = require('../models/VoteLog');
const {encryptVoteCount , decryptVoteCount} = require('../utils/encryption')
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
  const { electionName, description ,createdBy, voterLists, candidateLists, startTime, endTime, approvedBy } = req.body;
  try {
    const existingElection = await Election.findOne({ electionName });
    if (existingElection) {
      return res.status(400).json({ message: `Election "${electionName}" already exists.` });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) {
      return res.status(400).json({ message: 'End time must be greater than start time.' });
    }

    const newElection = new Election({
      electionName,
      description,
      createdBy,
      approvedBy,
      voterLists,
      candidateLists,
      startTime: start,
      endTime: end,
      isResultPublished: false,
    });

    await newElection.save();
    res.json({ success: true, message: `Election "${electionName}" created successfully.` });
  } catch (error) {
    console.error('Error creating election:', error);
    res.status(500).json({ message: 'Error creating election', error: error.message });
  }
});



// GET: Fetch elections based on role
router.get('/fetching', async (req, res) => {
   // createdBy is included only for non-head admins
  
  try {
    let elections;
      // If no createdBy is specified, fetch all elections (for Head Admin)
      elections = await Election.find({});

    res.status(200).json(elections);
  } catch (error) {
    console.error('Error fetching elections:', error);
    res.status(500).json({ success: false, message: 'Error fetching elections' });
  }
});

router.get('/ongoing-details', async (req, res) => {
  const { electionId } = req.query;

  try {
    // Validate election ID
    if (!electionId) {
      return res.status(400).json({ success: false, message: 'Election ID is required.' });
    }

    // Fetch election details
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found.' });
    }

    const currentTime = new Date();
    const startTime = new Date(election.startTime);
    const endTime = new Date(election.endTime);

    // Validate if the election is ongoing
    if (currentTime < startTime || currentTime > endTime) {
      return res.status(400).json({ success: false, message: 'Election is not currently ongoing.' });
    }

    // Fetch voter details
    const voterData = await ElectionVoters.findOne({ electionId });
    if (!voterData) {
      return res.status(404).json({ success: false, message: 'Voter data not found for this election.' });
    }

    const totalVoters = voterData.voters.length;
    const voterCount = voterData.voters.filter(voter => voter.isVoted).length;

    // Return details
    res.status(200).json({
      success: true,
      voterCount,
      totalVoters,
      electionDetails: {
        electionName: election.electionName,
        startTime: election.startTime,
        endTime: election.endTime,
      },
    });
  } catch (error) {
    console.error('Error fetching ongoing election details:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
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
router.get('/one/:id', async (req, res) => {
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
router.put('/one/:id', async (req, res) => {
  const { electionName, startTime, endTime, voters, candidates , description} = req.body;

  try {
    const updatedElection = await Election.findByIdAndUpdate(
      req.params.id,
      { electionName,
        description , startTime, endTime, voterLists : voters, candidateLists : candidates },
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

//deleting particular voter list or candidate list from election

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
router.post('/submit',  async (req, res) => {
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

//getting details of the created election by others
router.get('/pending', async (req, res) => {
  console.log(1);
  try {
    const pendingElections = await PendingElection.find();
    res.status(200).json(pendingElections);
  } catch (error) {
    console.error("Error fetching pending elections:", error.message);
    res.status(500).json({ success: false, message: 'Error fetching pending created elections', error: error.message });
  }
});


//rejecting the created election
router.delete('/reject-created/:id', async (req, res) => {
  console.log(1);
  try {
    const deletedRequest = await PendingElection.findByIdAndDelete(req.params.id);
    if (!deletedRequest) {
      return res.status(404).json({ success: false, message: 'Pending election not found' });
    }
    res.status(200).json({ success: true, message: 'Created election request rejected successfully', deletedRequestId: req.params.id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error rejecting created election', error: error.message });
  }
});

//getting details of the modified election by others
router.get('/pending-modifications', async (req, res) => {
  console.log(1);
  try {
    const pendingModifications = await PendingElectionForModifications.find();
    res.status(200).json(pendingModifications);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching pending modifications', error: error.message });
  }
});

//rejecting the modified election
router.delete('/reject-modification/:id', async (req, res) => {
  try {
    const deletedModification = await PendingElectionForModifications.findByIdAndDelete(req.params.id);
    if (!deletedModification) {
      return res.status(404).json({ success: false, message: 'Pending modification not found' });
    }
    res.status(200).json({ success: true, message: 'Modified election request rejected successfully', deletedRequestId: req.params.id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error rejecting modification', error: error.message });
  }
});

//difference between the current election and modified election
router.get('/difference/:id', async (req, res) => {
  try {
    const modifiedRequest = await PendingElectionForModifications.findOne({
      'originalElectionId'
      :req.params.id},{});
    if (!modifiedRequest) {
      return res.status(404).json({ success: false, message: 'Pending modification not found' });
    }
    const originalElection = await Election.find(modifiedRequest.originalElectionId , {});
    if (!originalElection) {
      return res.status(404).json({ success: false, message: 'Original election not found' });
    }

    const differences = {};
    for (const [key, value] of Object.entries(modifiedRequest.updatedFields)) {
      if (JSON.stringify(value) !== JSON.stringify(originalElection[key])) {
        differences[key] = { original: originalElection[key], modified: value };
      }
    }

    res.status(200).json({ originalElection, modifiedElection: modifiedRequest, differences });
  } catch (error) {
    res.status(404).json({ success: false, message: 'Error retrieving differences', error: error.message });
  }
});


// Fetch finished elections
router.get('/finished', async (req, res) => {
  try {
    const finishedElections = await Election.find({ 
      endTime: { $lt: new Date() }
    });
    res.status(200).json(finishedElections);
  } catch (error) {
    console.error('Error fetching finished elections:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Fetch election results
router.get('/results/:id', async (req, res) => {
  const { id: electionId } = req.params;

  try {
    // Find the election by ID
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found.' });
    }

    const { candidateLists } = election;

    // Fetch all candidates from the candidateLists
    const candidateData = [];
    for (const listName of candidateLists) {
      const candidateList = await Candidate.findOne({ listname: listName });
      if (candidateList && candidateList.candidates) {
        candidateData.push(...candidateList.candidates);
      }
    }
    // Fetch the encrypted vote counts from ElectionCandidates
    const electionCandidates = await ElectionCandidates.findOne({ electionId });
    if (!electionCandidates) {
      return res.status(404).json({ success: false, message: 'Election candidates not found.' });
    }

    // Combine candidate data with vote counts
    const candidates = electionCandidates.candidates.map(candidate => {
      const candidateInfo = candidateData.find(c => c.candidateId === candidate.candidateId);
      return {
        name: candidateInfo?.candidateName || 'None of the above',
        party: candidateInfo?.party || 'Nota',
        votes: decryptVoteCount(candidate.voteCount), 
      };
    });
    res.status(200).json({ success: true, candidates });
  } catch (error) {
    console.error('Error fetching election results:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});
//set election as published result election
router.post('/publish/:electionId', async (req, res) => {
  const { electionId } = req.params;

  try {
    // Find the election by ID
    const election = await Election.findById(electionId);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found.',
      });
    }

    // Check if the result is already published
    if (election.isResultPublished) {
      return res.status(400).json({
        success: false,
        message: 'Results are already published for this election.',
      });
    }

    // Update the `isResultPublished` field to `true`
    election.isResultPublished = true;
    await election.save();

    return res.status(200).json({
      success: true,
      message: 'Election results published successfully.',
    });
  } catch (error) {
    console.error('Error publishing election results:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while publishing election results.',
      error: error.message,
    });
  }
});


//move election to finished election
router.post('/move-to-finished/:id', async (req, res) => {
  const { id: electionId } = req.params;

  try {
    // Fetch election details
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found.' });
    }

    // Fetch voters details
    const electionVoters = await ElectionVoters.findOne({ electionId });
    if (!electionVoters) {
      return res.status(404).json({ success: false, message: 'Election voters data not found.' });
    }

    // Fetch candidates details
    const electionCandidates = await ElectionCandidates.findOne({ electionId });
    if (!electionCandidates) {
      return res.status(404).json({ success: false, message: 'Election candidates data not found.' });
    }

    // Fetch candidate data
    const candidateListNames = election.candidateLists || [];
    const candidateData = await Candidate.find({ listname: { $in: candidateListNames } });

    // Process candidates and decrypt vote counts
    const candidatesToSave = await Promise.all(
      electionCandidates.candidates.map(async (candidate) => {
        const candidateDetails = candidateData
          .flatMap((list) => list.candidates)
          .find((c) => c.candidateId === candidate.candidateId);
        return {
          candidateId: candidate.candidateId,
          name: candidateDetails?.candidateName || 'None of the above',
          party: candidateDetails?.party || 'NOTA',
          votes: decryptVoteCount(candidate.voteCount),
        };
      })
    );

    // Determine winner
    const winner = candidatesToSave.reduce((prev, current) =>
      prev.votes > current.votes ? prev : current
    );

    // Populate voter participation details
    const votersParticipated = electionVoters.voters.filter((voter) => voter.isVoted);
    const votersNotParticipated = electionVoters.voters.filter((voter) => !voter.isVoted);

    // Prepare the data for the `electionEnded` collection
    const electionEndedData = {
      electionId: election._id,
      electionName: election.electionName,
      startTime: election.startTime,
      endTime: election.endTime,
      description: election.description,
      votersParticipated: votersParticipated.map((voter) => voter.voterId),
      votersNotParticipated: votersNotParticipated.map((voter) => voter.voterId),
      candidates: candidatesToSave,
      winner: {
        candidateId: winner.candidateId,
        name: winner.name || 'None of the above',
        party: winner.party || 'NOTA',
        votes: winner.votes,
      },
      createdBy: election.createdBy,
    };

    // Save to `electionEnded` collection
    await new ElectionEnded(electionEndedData).save();

    // Remove the election and associated data from other collections
    await Promise.all([
      Election.findByIdAndDelete(electionId),
      ElectionVoters.deleteOne({ electionId }),
      ElectionCandidates.deleteOne({ electionId }),
      VoteLog.deleteMany({electionId})
    ]);

    res.status(200).json({ success: true, message: 'Election moved to finished successfully.' });
  } catch (error) {
    console.error('Error moving election to finished:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});


//voter side starting



// Voter Login Endpoint
router.post('/voter-login', async (req, res) => {
  const { electionName, voterId, password } = req.body;

  try {
    // Step 1: Fetch election by name
    const election = await Election.findOne({ electionName });
    if (!election) {
      return res.status(200).json({ success: false, message: 'Election not found' });
    }

    // Step 2: Check voter lists in the election
    const voterListNames = election.voterLists || [];

    // Step 3: Search for the voter in the voter lists
    const voterLists = await Voter.find({ listname: { $in: voterListNames } });
if (!voterLists || voterLists.length === 0) {
  return res.status(404).json({ success: false, message: 'No voter list found' });
}

// Step 4: Check if the voter exists in any of the voter lists
let voterFound = null;
for (const list of voterLists) {
  voterFound = list.voters.find((voter) => voter.voterId === voterId);
  if (voterFound) break; // Exit the loop as soon as the voter is found
}

if (!voterFound) {
  return res.status(200).json({ success: false, message: 'Voter not found in the list' });
}

// Step 5: Verify password
const isPasswordValid = voterFound.password === password;
if (!isPasswordValid) {
  return res.status(200).json({ success: false, message: 'Invalid password' });
}

    const currTime = new Date();
    // Step 6: Check voting status in ElectionVoters
    if(currTime >= election.startTime && currTime <= election.endTime){
    const votersDoc = await ElectionVoters.findOne({ electionId: election._id });
    if (!votersDoc) {
      return res.status(404).json({ success: false, message: 'Election voters data not found' });
    }

    const voterStatus = votersDoc.voters.find((v) => v.voterId === voterId);
    if (voterStatus && voterStatus.isVoted) {
      return res.status(200).json({
        success: false,
        message: 'You have already voted. Access will be allowed only after the election finishes.',
      });
    }
  }
    // Step 7: Return success response with voter and election details
    res.status(200).json({
      success: true,
      message: 'Login successful',
      voter: {
        voterId: voterFound.voterId,
        voterName: voterFound.voterName,
        address: voterFound.address,
        age: voterFound.age,
        electionDetails: {
          electionName: election.electionName,
          electionId: election._id,
          startTime: election.startTime,
          endTime: election.endTime,
          description:election.description
        },
      },
    });
  } catch (error) {
    console.error('Error during voter login:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});




router.post('/electionCandidates-details', async (req, res) => {
  const { electionId } = req.body;

  try {
    // Fetch the election by ID
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    const candidatesLists = election.candidateLists || [];
    const allCandidates = [];

    // Fetch candidates for each candidates list
    for (const listname of candidatesLists) {
      const candidateList = await Candidate.findOne({ listname });
      if (candidateList) {
        allCandidates.push(...candidateList.candidates);
      }
    }

    // Remove duplicate candidates based on candidateId
    const uniqueCandidates = Array.from(
      new Map(allCandidates.map(candidate => [candidate.candidateId, candidate])).values()
    );
    uniqueCandidates.push({
      'candidateId' : 'C1NOTA2',
      'candidateName' : 'None of the above',
      'party':'NOTA'
    })
    res.status(200).json({
      success: true,
      candidates: uniqueCandidates.map(candidate => ({
        candidateId: candidate.candidateId,
        name: candidate.candidateName,
        party: candidate.party, // Assuming `party` is a field in the candidate schema
      })),
    });
  } catch (error) {
    console.error('Error fetching election details:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});


// Endpoint to cast a vote
router.post('/cast-vote', async (req, res) => {
  const { electionId, candidateId, voterId } = req.body;
  try {
    const timestamp = new Date().toISOString();
    const dataToHash = `${electionId}:${candidateId}:${voterId}:${timestamp}`;
    const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');

    // Step 1: Check if voter already voted
    const existingVote = await VoteLog.findOne({ electionId, voterId });
    if (existingVote) {
      return res.status(400).json({ success: false, message: 'You have already voted in this election.' });
    }

    // Step 2: Fetch election and candidate
    const election = await ElectionCandidates.findOne({ electionId });
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    const candidate = election.candidates.find(c => c.candidateId === candidateId);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    // Step 3: Decrypt, increment, and encrypt vote count
    const currentVoteCount = decryptVoteCount(candidate.voteCount);
    const newVoteCount = encryptVoteCount(currentVoteCount + 1);

    await ElectionCandidates.updateOne(
      { electionId, 'candidates.candidateId': candidateId },
      { $set: { 'candidates.$.voteCount': newVoteCount } }
    );

    // Step 4: Log the vote
    await new VoteLog({ electionId, voterId, candidateId, hash, timestamp }).save();

    // Step 5: Update voter status
    await ElectionVoters.updateOne(
      { electionId, 'voters.voterId': voterId },
      { $set: { 'voters.$.isVoted': true } }
    );

    res.status(200).json({ success: true, message: 'Vote cast successfully.' });
  } catch (error) {
    console.error('Error casting vote:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});



/**
 * Check if the result for a specific election is published
 * @route POST /api/elections/is-result-published
 * @param {string} electionId - ID of the election to check
 * @returns {object} success and isPublished status
 */
router.post('/is-result-published', async (req, res) => {
  const { electionId } = req.body;

  try {
    // Fetch the election by ID
    const election = await Election.findById(electionId);

    // If no election found, return error
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    // Return the result status
    res.status(200).json({ success: true, isPublished: election.isResultPublished });
  } catch (error) {
    console.error('Error checking result status:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});


// Schedule the job to run every minute

module.exports = router;
