const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Election = require('../models/Election');
const PendingElection = require('../models/PendingElection');
const PendingElectionForModifications = require('../models/PendingElectionForModifications');
const Voter = require('../models/Voters');
const Candidate = require('../models/Candidates');
const PendingVoterList = require('../models/PendingVoterList');
const PendingCandidateList = require('../models/PendingCandidateList');
const RejectedElection = require('../models/RejectedElection');
const RejectedModification = require('../models/RejectedModification');
const Admin = require('../models/Admin');
const ElectionCandidates = require('../models/ElectionCandidates');
const ElectionVoters = require('../models/ElectionVoters');
const VoteLog = require('../models/VoteLog');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { generateOTP, sendOTPEmail, sendElectionCreationEmail, sendElectionUpdateEmail, sendElectionCancellationEmail } = require('../utils/emailService');
const { encryptVoteCount, decryptVoteCount } = require('../utils/encryption');
require('dotenv').config();

// Helper functions
const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

const generateRequestId = (type) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${type.toUpperCase()}_${timestamp}_${random}`;
};

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

// Endpoint to fetch all voter lists
router.get('/voters/all-lists', async (req, res) => {
    try {
        const voterLists = await Voter.find({}, { listname: 1, _id: 0 }); // Retrieve only the `listname` field
        const lists = voterLists.map((voterList) => voterList.listname); // Extract `listname` values into an array

        res.status(200).json({ success: true, lists });
    } catch (error) {
        console.error('Error fetching voter lists:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch voter lists', error: error.message });
    }
});

// Endpoint to fetch all candidate lists
router.get('/candidates/all-lists', async (req, res) => {
    try {
        const candidateLists = await Candidate.find({}, { listname: 1, _id: 0 }); // Retrieve only the `listname` field
        const lists = candidateLists.map((candidateList) => candidateList.listname); // Extract `listname` values into an array

        res.status(200).json({ success: true, lists });
    } catch (error) {
        console.error('Error fetching candidate lists:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch candidate lists', error: error.message });
    }
});

//checking voter list is present or not
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
    const { electionName, description, createdBy, voterLists, candidateLists, startTime, endTime, approvedBy } = req.body;
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

        // Send emails to all voters in the selected lists
        // Fetch all voter lists involved
        const lists = await Voter.find({ listname: { $in: voterLists } });

        // Flatten all voters from all lists
        const allVoters = lists.flatMap(list => list.voters);

        // Send email to each voter asynchronously
        allVoters.forEach(voter => {
            if (voter.email) {
                // Assuming password is stored in voter object, though in production it should be handled more securely
                // If password is not available here (e.g. hashed), we might need to rethink how we send credentials
                // For now, using the password field from the voter object as per current schema
                sendElectionCreationEmail(voter.email, voter.voterName, electionName, voter.voterId, voter.password)
                    .catch(err => console.error(`Failed to send email to ${voter.email}:`, err));
            }
        });

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
        const election = await Election.findById(id);

        if (election) {
            // Send emails to all voters in the selected lists
            const lists = await Voter.find({ listname: { $in: election.voterLists } });
            const allVoters = lists.flatMap(list => list.voters);

            allVoters.forEach(voter => {
                if (voter.email) {
                    sendElectionCancellationEmail(voter.email, voter.voterName, election.electionName)
                        .catch(err => console.error(`Failed to send cancellation email to ${voter.email}:`, err));
                }
            });
        }

        await Election.findByIdAndDelete(id);
        res.status(200).json({ message: 'Election deleted successfully' });
    } catch (error) {
        console.error("Error deleting election:", error);
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
    const { electionName, startTime, endTime, voters, candidates, description } = req.body;

    try {
        const currentElection = await Election.findById(req.params.id);
        if (!currentElection) {
            return res.status(404).json({ message: 'Election not found' });
        }

        const oldStart = new Date(currentElection.startTime).getTime();
        const oldEnd = new Date(currentElection.endTime).getTime();
        const newStart = new Date(startTime).getTime();
        const newEnd = new Date(endTime).getTime();

        const timeChanged = oldStart !== newStart || oldEnd !== newEnd;

        const updatedElection = await Election.findByIdAndUpdate(
            req.params.id,
            {
                electionName,
                description, startTime, endTime, voterLists: voters, candidateLists: candidates
            },
            { new: true, runValidators: true }
        );

        if (timeChanged) {
            // Send emails to all voters in the selected lists
            const lists = await Voter.find({ listname: { $in: updatedElection.voterLists } });
            const allVoters = lists.flatMap(list => list.voters);

            allVoters.forEach(voter => {
                if (voter.email) {
                    sendElectionUpdateEmail(voter.email, voter.voterName, electionName, startTime, endTime)
                        .catch(err => console.error(`Failed to send update email to ${voter.email}:`, err));
                }
            });
        }

        res.json({ success: true, message: 'Election updated successfully', updatedElection });
    } catch (error) {
        console.error("Error updating election:", error);
        res.status(500).json({ message: 'Error updating election' });
    }
});

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
router.post('/submit', async (req, res) => {
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

        // Send emails to all voters in the selected lists
        const lists = await Voter.find({ listname: { $in: approvedElection.voterLists } });
        const allVoters = lists.flatMap(list => list.voters);

        allVoters.forEach(voter => {
            if (voter.email) {
                sendElectionCreationEmail(voter.email, voter.voterName, approvedElection.electionName, voter.voterId, voter.password)
                    .catch(err => console.error(`Failed to send email to ${voter.email}:`, err));
            }
        });

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
router.put('/approve-modification/:id', async (req, res) => {
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
router.post('/reject-created/:id', async (req, res) => {
    const { reason, rejectedBy } = req.body;
    try {
        const pendingElection = await PendingElection.findById(req.params.id);
        if (!pendingElection) {
            return res.status(404).json({ success: false, message: 'Pending election not found' });
        }

        const rejectedElection = new RejectedElection({
            ...pendingElection.toObject(),
            rejectionReason: reason,
            rejectedBy: rejectedBy
        });
        await rejectedElection.save();

        await PendingElection.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Created election request rejected successfully', deletedRequestId: req.params.id });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error rejecting created election', error: error.message });
    }
});

//getting details of the modified election by others
router.get('/pending-modifications', async (req, res) => {
    try {
        const pendingModifications = await PendingElectionForModifications.find();
        res.status(200).json(pendingModifications);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching pending modifications', error: error.message });
    }
});

//rejecting the modified election
router.post('/reject-modification/:id', async (req, res) => {
    const { reason, rejectedBy } = req.body;
    try {
        const pendingModification = await PendingElectionForModifications.findById(req.params.id);
        if (!pendingModification) {
            return res.status(404).json({ success: false, message: 'Pending modification not found' });
        }

        const rejectedModification = new RejectedModification({
            ...pendingModification.toObject(),
            rejectionReason: reason,
            rejectedBy: rejectedBy
        });
        await rejectedModification.save();

        await PendingElectionForModifications.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Modified election request rejected successfully', deletedRequestId: req.params.id });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error rejecting modification', error: error.message });
    }
});

// Fetch My Requests (Pending & Rejected)
router.get('/my-requests', async (req, res) => {
    const { username } = req.query;
    if (!username) return res.status(400).json({ success: false, message: 'Username required' });

    try {
        const pendingCreated = await PendingElection.find({ createdBy: username });
        const pendingModified = await PendingElectionForModifications.find({ modifiedBy: username });
        const rejectedCreated = await RejectedElection.find({ createdBy: username });
        const rejectedModified = await RejectedModification.find({ modifiedBy: username });

        res.status(200).json({
            success: true,
            pending: { created: pendingCreated, modified: pendingModified },
            rejected: { created: rejectedCreated, modified: rejectedModified }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching my requests', error: error.message });
    }
});

//difference between the current election and modified election
router.get('/difference/:id', async (req, res) => {
    try {
        const modifiedRequest = await PendingElectionForModifications.findOne({
            'originalElectionId'
                : req.params.id
        }, {});
        if (!modifiedRequest) {
            return res.status(404).json({ success: false, message: 'Pending modification not found' });
        }
        const originalElection = await Election.find(modifiedRequest.originalElectionId, {});
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

router.post("/voters/create", async (req, res) => {
    const { listname, voters } = req.body;
    const adminToken = req.headers.authorization?.split(' ')[1];

    try {
        // Verify admin token and get admin info
        const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id);

        if (!admin) {
            return res.status(401).json({ success: false, message: "Unauthorized access" });
        }

        const existingList = await Voter.findOne({ listname });
        if (existingList) {
            return res.status(400).json({ success: false, message: "Voter list already exists." });
        }

        // Validate that all voters have email addresses
        for (const voter of voters) {
            if (!voter.email) {
                return res.status(400).json({
                    success: false,
                    message: `Email is required for voter ${voter.voterName || voter.voterId}`
                });
            }
        }

        // Check if admin is Head Admin
        if (admin.role === 'Head Admin') {
            // Head Admin can create directly
            const votersWithPasswords = voters.map(voter => ({
                ...voter,
                password: generateRandomPassword()
            }));

            const newList = new Voter({
                listname,
                voters: votersWithPasswords,
            });
            await newList.save();

            res.status(201).json({
                success: true,
                message: "Voter list created successfully with random passwords generated.",
                voters: votersWithPasswords.map(voter => ({
                    voterId: voter.voterId,
                    voterName: voter.voterName,
                    email: voter.email,
                    password: voter.password
                }))
            });
        } else {
            // Other admins need to submit for approval
            const requestId = generateRequestId('voter');

            const pendingRequest = new PendingVoterList({
                requestId,
                requestedBy: {
                    adminId: admin.adminId,
                    username: admin.username,
                    role: admin.role
                },
                listname,
                voters
            });

            await pendingRequest.save();

            res.status(202).json({
                success: true,
                message: "Voter list request submitted for Head Admin approval.",
                requestId,
                status: 'pending'
            });
        }
    } catch (error) {
        console.error("Error creating voter list:", error);
        res.status(500).json({ success: false, message: "Failed to create voter list." });
    }
});

// Create a new candidate list
router.post("/candidates/create", async (req, res) => {
    const { listname, candidates } = req.body;
    const adminToken = req.headers.authorization?.split(' ')[1];

    try {
        // Verify admin token and get admin info
        const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id);

        if (!admin) {
            return res.status(401).json({ success: false, message: "Unauthorized access" });
        }

        const existingList = await Candidate.findOne({ listname });
        if (existingList) {
            return res.status(400).json({ success: false, message: "Candidate list already exists." });
        }

        // Check if admin is Head Admin
        if (admin.role === 'Head Admin') {
            // Head Admin can create directly
            const newList = new Candidate({
                listname,
                candidates,
            });
            await newList.save();

            res.status(201).json({ success: true, message: "Candidate list created successfully." });
        } else {
            // Other admins need to submit for approval
            const requestId = generateRequestId('candidate');

            const pendingRequest = new PendingCandidateList({
                requestId,
                requestedBy: {
                    adminId: admin.adminId,
                    username: admin.username,
                    role: admin.role
                },
                listname,
                candidates
            });

            await pendingRequest.save();

            res.status(202).json({
                success: true,
                message: "Candidate list request submitted for Head Admin approval.",
                requestId,
                status: 'pending'
            });
        }
    } catch (error) {
        console.error("Error creating candidate list:", error);
        res.status(500).json({ success: false, message: "Failed to create candidate list." });
    }
});

// Fetch all voter and candidate lists
router.get('/all', async (req, res) => {
    try {
        const voterLists = await Voter.find({}, 'listname');
        const candidateLists = await Candidate.find({}, 'listname');
        console.log(voterLists);
        res.status(200).json({
            voterLists: voterLists.map((list) => ({ _id: list._id, listname: list.listname })),
            candidateLists: candidateLists.map((list) => ({ _id: list._id, listname: list.listname })),
        });
    } catch (error) {
        console.error('Error fetching lists:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch lists.' });
    }
});

// Create new voter or candidate list
router.post('/:type/create', async (req, res) => {
    const { type } = req.params;
    const { listname, items } = req.body;

    if (!listname || !items || items.length < 2) {
        return res.status(400).json({ success: false, message: 'List name and at least 2 items are required.' });
    }

    try {
        if (type === 'voters') {
            const existingList = await Voter.findOne({ listname });
            if (existingList) {
                return res.status(400).json({ success: false, message: 'Voter list with this name already exists.' });
            }

            const newVoterList = new Voter({ listname, voters: items });
            await newVoterList.save();
        } else if (type === 'candidates') {
            const existingList = await Candidate.findOne({ listname });
            if (existingList) {
                return res.status(400).json({ success: false, message: 'Candidate list with this name already exists.' });
            }

            const newCandidateList = new Candidate({ listname, candidates: items });
            await newCandidateList.save();
        } else {
            return res.status(400).json({ success: false, message: 'Invalid list type.' });
        }

        res.status(201).json({ success: true, message: `${type === 'voters' ? 'Voter' : 'Candidate'} list created successfully.` });
    } catch (error) {
        console.error('Error creating list:', error);
        res.status(500).json({ success: false, message: 'Failed to create list.' });
    }
});

// Update voter or candidate list
router.put('/:type/update/:id', async (req, res) => {
    const { type, id } = req.params;
    const { listname, items } = req.body;

    if (!listname || !items || items.length < 2) {
        return res.status(400).json({ success: false, message: 'List name and at least 2 items are required.' });
    }

    try {
        if (type === 'voters') {
            const existingList = await Voter.findById(id);
            if (!existingList) {
                return res.status(404).json({ success: false, message: 'Voter list not found.' });
            }

            existingList.listname = listname;
            existingList.voters = items;
            await existingList.save();
        } else if (type === 'candidates') {
            const existingList = await Candidate.findById(id);
            if (!existingList) {
                return res.status(404).json({ success: false, message: 'Candidate list not found.' });
            }

            existingList.listname = listname;
            existingList.candidates = items;
            await existingList.save();
        } else {
            return res.status(400).json({ success: false, message: 'Invalid list type.' });
        }

        res.status(200).json({ success: true, message: `${type === 'voters' ? 'Voter' : 'Candidate'} list updated successfully.` });
    } catch (error) {
        console.error('Error updating list:', error);
        res.status(500).json({ success: false, message: 'Failed to update list.' });
    }
});

// Delete voter or candidate list
router.delete('/:type/delete/:id', async (req, res) => {
    const { type, id } = req.params;

    try {
        if (type === 'voters') {
            const deletedList = await Voter.findByIdAndDelete(id);
            if (!deletedList) {
                return res.status(404).json({ success: false, message: 'Voter list not found.' });
            }
        } else if (type === 'candidates') {
            const deletedList = await Candidate.findByIdAndDelete(id);
            if (!deletedList) {
                return res.status(404).json({ success: false, message: 'Candidate list not found.' });
            }
        } else {
            return res.status(400).json({ success: false, message: 'Invalid list type.' });
        }

        res.status(200).json({ success: true, message: `${type === 'voters' ? 'Voter' : 'Candidate'} list deleted successfully.` });
    } catch (error) {
        console.error('Error deleting list:', error);
        res.status(500).json({ success: false, message: 'Failed to delete list.' });
    }
});

// Voter Login Endpoint - Step 1: Verify election and voter
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
        if (currTime >= election.startTime && currTime <= election.endTime) {
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

        // Step 7: Generate and send OTP
        const otp = generateOTP();

        // Save OTP to database
        await new OTP({
            voterId: voterFound.voterId,
            electionId: election._id.toString(),
            otp: otp,
            email: voterFound.email
        }).save();

        // Send OTP email
        await sendOTPEmail(voterFound.email, voterFound.voterName, otp);

        // Step 8: Return success response indicating OTP sent
        res.status(200).json({
            success: true,
            message: 'OTP sent to your email. Please check your email and enter the OTP.',
            requiresOTP: true,
            voter: {
                voterId: voterFound.voterId,
                voterName: voterFound.voterName,
                email: voterFound.email,
                address: voterFound.address,
                age: voterFound.age,
                electionDetails: {
                    electionName: election.electionName,
                    electionId: election._id,
                    startTime: election.startTime,
                    endTime: election.endTime,
                    description: election.description
                },
            },
        });
    } catch (error) {
        console.error('Error during voter login:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// Voter OTP Verification Endpoint
router.post('/voter-verify-otp', async (req, res) => {
    const { electionId, voterId, otp } = req.body;

    try {
        // Find the OTP record
        const otpRecord = await OTP.findOne({
            voterId: voterId,
            electionId: electionId,
            otp: otp
        });

        if (!otpRecord) {
            return res.status(200).json({
                success: false,
                message: 'Invalid OTP or OTP has expired'
            });
        }

        // Delete the used OTP
        await OTP.findByIdAndDelete(otpRecord._id);

        // Find voter details
        const election = await Election.findById(electionId);
        if (!election) {
            return res.status(404).json({ success: false, message: 'Election not found' });
        }

        const voterLists = await Voter.find({ listname: { $in: election.voterLists } });
        let voterFound = null;
        for (const list of voterLists) {
            voterFound = list.voters.find((voter) => voter.voterId === voterId);
            if (voterFound) break;
        }

        if (!voterFound) {
            return res.status(404).json({ success: false, message: 'Voter not found' });
        }

        // Return success response with voter and election details
        res.status(200).json({
            success: true,
            message: 'OTP verified successfully. Login successful.',
            voter: {
                voterId: voterFound.voterId,
                voterName: voterFound.voterName,
                email: voterFound.email,
                address: voterFound.address,
                age: voterFound.age,
                electionDetails: {
                    electionName: election.electionName,
                    electionId: election._id,
                    startTime: election.startTime,
                    endTime: election.endTime,
                    description: election.description
                },
            },
        });
    } catch (error) {
        console.error('Error during OTP verification:', error);
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
            'candidateId': 'C1NOTA2',
            'candidateName': 'None of the above',
            'party': 'NOTA'
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

// Public View Endpoint - Allow voters to view live election details
router.post('/public-view', async (req, res) => {
    const { electionName, voterId, email, password, otp } = req.body;

    try {
        // Step 1: Find the election
        const election = await Election.findOne({ electionName });
        if (!election) {
            return res.status(200).json({ success: false, message: 'Election not found' });
        }

        // Step 2: Find the voter in the election
        const electionVoters = await ElectionVoters.findOne({ electionId: election._id });
        if (!electionVoters) {
            return res.status(200).json({ success: false, message: 'Voter not found in this election' });
        }

        const voterInElection = electionVoters.voters.find(v => v.voterId === voterId);
        if (!voterInElection) {
            return res.status(200).json({ success: false, message: 'Voter not found in this election' });
        }

        // Step 3: Find the voter details from voter lists
        const voterLists = election.voterLists || [];
        let voterFound = null;

        for (const listName of voterLists) {
            const voterList = await Voter.findOne({ listname: listName });
            if (voterList) {
                const voter = voterList.voters.find(v => v.voterId === voterId);
                if (voter) {
                    voterFound = voter;
                    break;
                }
            }
        }

        if (!voterFound) {
            return res.status(200).json({ success: false, message: 'Voter details not found' });
        }

        // Step 4: Verify email
        if (voterFound.email !== email) {
            return res.status(200).json({ success: false, message: 'Invalid email address' });
        }

        // Step 5: Verify password
        if (voterFound.password !== password) {
            return res.status(200).json({ success: false, message: 'Invalid password' });
        }

        // Step 6: Verify OTP
        const otpRecord = await OTP.findOne({
            voterId: voterId,
            electionId: election._id.toString(),
            otp: otp
        });

        if (!otpRecord) {
            return res.status(200).json({ success: false, message: 'Invalid OTP or OTP has expired' });
        }

        // Step 7: Delete the OTP after successful verification
        await OTP.findByIdAndDelete(otpRecord._id);

        // Step 8: Get election candidates and their vote counts
        const electionCandidates = await ElectionCandidates.findOne({ electionId: election._id });
        if (!electionCandidates) {
            return res.status(200).json({ success: false, message: 'Election candidates not found' });
        }

        // Step 9: Decrypt vote counts for display
        const candidatesWithVotes = electionCandidates.candidates.map(candidate => ({
            candidateId: candidate.candidateId,
            voteCount: decryptVoteCount(candidate.voteCount)
        }));

        // Step 10: Check if voter has already voted
        const voteLog = await VoteLog.findOne({
            electionId: election._id.toString(),
            voterId: voterId
        });

        const hasVoted = !!voteLog;

        // Step 11: Return public view data
        res.status(200).json({
            success: true,
            message: 'Public view access granted',
            election: {
                electionName: election.electionName,
                description: election.description,
                startTime: election.startTime,
                endTime: election.endTime,
                isActive: new Date() >= election.startTime && new Date() <= election.endTime
            },
            voter: {
                voterId: voterFound.voterId,
                voterName: voterFound.voterName,
                email: voterFound.email
            },
            candidates: candidatesWithVotes,
            hasVoted: hasVoted,
            totalVotes: candidatesWithVotes.reduce((sum, candidate) => sum + candidate.voteCount, 0),
            currentTime: new Date()
        });

    } catch (error) {
        console.error('Error in public view:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Public View OTP Generation Endpoint
router.post('/public-view-otp', async (req, res) => {
    const { electionName, voterId, email, password } = req.body;

    try {
        // Step 1: Find the election
        const election = await Election.findOne({ electionName });
        if (!election) {
            return res.status(200).json({ success: false, message: 'Election not found' });
        }

        // Step 2: Find the voter in the election
        const electionVoters = await ElectionVoters.findOne({ electionId: election._id });
        if (!electionVoters) {
            return res.status(200).json({ success: false, message: 'Voter not found in this election' });
        }

        const voterInElection = electionVoters.voters.find(v => v.voterId === voterId);
        if (!voterInElection) {
            return res.status(200).json({ success: false, message: 'Voter not found in this election' });
        }

        // Step 3: Find the voter details from voter lists
        const voterLists = election.voterLists || [];
        let voterFound = null;

        for (const listName of voterLists) {
            const voterList = await Voter.findOne({ listname: listName });
            if (voterList) {
                const voter = voterList.voters.find(v => v.voterId === voterId);
                if (voter) {
                    voterFound = voter;
                    break;
                }
            }
        }

        if (!voterFound) {
            return res.status(200).json({ success: false, message: 'Voter details not found' });
        }

        // Step 4: Verify email
        if (voterFound.email !== email) {
            return res.status(200).json({ success: false, message: 'Invalid email address' });
        }

        // Step 5: Verify password
        if (voterFound.password !== password) {
            return res.status(200).json({ success: false, message: 'Invalid password' });
        }

        // Step 6: Generate and send OTP
        const otp = generateOTP();

        // Save OTP to database
        await new OTP({
            voterId: voterFound.voterId,
            electionId: election._id.toString(),
            otp: otp,
            email: voterFound.email
        }).save();

        // Send OTP email
        await sendOTPEmail(voterFound.email, voterFound.voterName, otp);

        res.status(200).json({
            success: true,
            message: 'OTP sent to your email for public view access',
            requiresOTP: true
        });

    } catch (error) {
        console.error('Error generating public view OTP:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get all pending voter list requests (Head Admin only)
router.get('/pending-voter-lists', async (req, res) => {
    const adminToken = req.headers.authorization?.split(' ')[1];

    try {
        // Verify admin token and get admin info
        const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id);

        if (!admin || admin.role !== 'Head Admin') {
            return res.status(403).json({ success: false, message: "Only Head Admin can view pending requests" });
        }

        const pendingRequests = await PendingVoterList.find({ status: 'pending' }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            pendingRequests
        });
    } catch (error) {
        console.error("Error fetching pending voter lists:", error);
        res.status(500).json({ success: false, message: "Failed to fetch pending requests." });
    }
});

// Get all pending candidate list requests (Head Admin only)
router.get('/pending-candidate-lists', async (req, res) => {
    const adminToken = req.headers.authorization?.split(' ')[1];

    try {
        // Verify admin token and get admin info
        const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id);

        if (!admin || admin.role !== 'Head Admin') {
            return res.status(403).json({ success: false, message: "Only Head Admin can view pending requests" });
        }

        const pendingRequests = await PendingCandidateList.find({ status: 'pending' }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            pendingRequests
        });
    } catch (error) {
        console.error("Error fetching pending candidate lists:", error);
        res.status(500).json({ success: false, message: "Failed to fetch pending requests." });
    }
});

// Approve voter list request (Head Admin only)
router.post('/approve-voter-list/:requestId', async (req, res) => {
    const { requestId } = req.params;
    const { reviewNotes } = req.body;
    const adminToken = req.headers.authorization?.split(' ')[1];

    try {
        // Verify admin token and get admin info
        const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id);

        if (!admin || admin.role !== 'Head Admin') {
            return res.status(403).json({ success: false, message: "Only Head Admin can approve requests" });
        }

        const pendingRequest = await PendingVoterList.findOne({ requestId });
        if (!pendingRequest) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        if (pendingRequest.status !== 'pending') {
            return res.status(400).json({ success: false, message: "Request has already been processed" });
        }

        // Check if list name already exists
        const existingList = await Voter.findOne({ listname: pendingRequest.listname });
        if (existingList) {
            return res.status(400).json({ success: false, message: "Voter list with this name already exists" });
        }

        // Generate random passwords for all voters
        const votersWithPasswords = pendingRequest.voters.map(voter => ({
            ...voter,
            password: generateRandomPassword()
        }));

        // Create the voter list
        const newList = new Voter({
            listname: pendingRequest.listname,
            voters: votersWithPasswords,
        });
        await newList.save();

        // Update pending request status
        pendingRequest.status = 'approved';
        pendingRequest.reviewedBy = {
            adminId: admin.adminId,
            username: admin.username,
            role: admin.role
        };
        pendingRequest.reviewDate = new Date();
        pendingRequest.reviewNotes = reviewNotes || 'Approved by Head Admin';
        await pendingRequest.save();

        res.status(200).json({
            success: true,
            message: "Voter list request approved and created successfully",
            voters: votersWithPasswords.map(voter => ({
                voterId: voter.voterId,
                voterName: voter.voterName,
                email: voter.email,
                password: voter.password
            }))
        });
    } catch (error) {
        console.error("Error approving voter list request:", error);
        res.status(500).json({ success: false, message: "Failed to approve request." });
    }
});

// Reject voter list request (Head Admin only)
router.post('/reject-voter-list/:requestId', async (req, res) => {
    const { requestId } = req.params;
    const { reviewNotes } = req.body;
    const adminToken = req.headers.authorization?.split(' ')[1];

    try {
        // Verify admin token and get admin info
        const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id);

        if (!admin || admin.role !== 'Head Admin') {
            return res.status(403).json({ success: false, message: "Only Head Admin can reject requests" });
        }

        const pendingRequest = await PendingVoterList.findOne({ requestId });
        if (!pendingRequest) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        if (pendingRequest.status !== 'pending') {
            return res.status(400).json({ success: false, message: "Request has already been processed" });
        }

        // Update pending request status
        pendingRequest.status = 'rejected';
        pendingRequest.reviewedBy = {
            adminId: admin.adminId,
            username: admin.username,
            role: admin.role
        };
        pendingRequest.reviewDate = new Date();
        pendingRequest.reviewNotes = reviewNotes || 'Rejected by Head Admin';
        await pendingRequest.save();

        res.status(200).json({
            success: true,
            message: "Voter list request rejected successfully"
        });
    } catch (error) {
        console.error("Error rejecting voter list request:", error);
        res.status(500).json({ success: false, message: "Failed to reject request." });
    }
});

// Approve candidate list request (Head Admin only)
router.post('/approve-candidate-list/:requestId', async (req, res) => {
    const { requestId } = req.params;
    const { reviewNotes } = req.body;
    const adminToken = req.headers.authorization?.split(' ')[1];

    try {
        // Verify admin token and get admin info
        const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id);

        if (!admin || admin.role !== 'Head Admin') {
            return res.status(403).json({ success: false, message: "Only Head Admin can approve requests" });
        }

        const pendingRequest = await PendingCandidateList.findOne({ requestId });
        if (!pendingRequest) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        if (pendingRequest.status !== 'pending') {
            return res.status(400).json({ success: false, message: "Request has already been processed" });
        }

        // Check if list name already exists
        const existingList = await Candidate.findOne({ listname: pendingRequest.listname });
        if (existingList) {
            return res.status(400).json({ success: false, message: "Candidate list with this name already exists" });
        }

        // Create the candidate list
        const newList = new Candidate({
            listname: pendingRequest.listname,
            candidates: pendingRequest.candidates,
        });
        await newList.save();

        // Update pending request status
        pendingRequest.status = 'approved';
        pendingRequest.reviewedBy = {
            adminId: admin.adminId,
            username: admin.username,
            role: admin.role
        };
        pendingRequest.reviewDate = new Date();
        pendingRequest.reviewNotes = reviewNotes || 'Approved by Head Admin';
        await pendingRequest.save();

        res.status(200).json({
            success: true,
            message: "Candidate list request approved and created successfully"
        });
    } catch (error) {
        console.error("Error approving candidate list request:", error);
        res.status(500).json({ success: false, message: "Failed to approve request." });
    }
});

// Reject candidate list request (Head Admin only)
router.post('/reject-candidate-list/:requestId', async (req, res) => {
    const { requestId } = req.params;
    const { reviewNotes } = req.body;
    const adminToken = req.headers.authorization?.split(' ')[1];

    try {
        // Verify admin token and get admin info
        const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id);

        if (!admin || admin.role !== 'Head Admin') {
            return res.status(403).json({ success: false, message: "Only Head Admin can reject requests" });
        }

        const pendingRequest = await PendingCandidateList.findOne({ requestId });
        if (!pendingRequest) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        if (pendingRequest.status !== 'pending') {
            return res.status(400).json({ success: false, message: "Request has already been processed" });
        }

        // Update pending request status
        pendingRequest.status = 'rejected';
        pendingRequest.reviewedBy = {
            adminId: admin.adminId,
            username: admin.username,
            role: admin.role
        };
        pendingRequest.reviewDate = new Date();
        pendingRequest.reviewNotes = reviewNotes || 'Rejected by Head Admin';
        await pendingRequest.save();

        res.status(200).json({
            success: true,
            message: "Candidate list request rejected successfully"
        });
    } catch (error) {
        console.error("Error rejecting candidate list request:", error);
        res.status(500).json({ success: false, message: "Failed to reject request." });
    }
});

// Get request status for non-Head Admin users
router.get('/request-status/:requestId', async (req, res) => {
    const { requestId } = req.params;
    const adminToken = req.headers.authorization?.split(' ')[1];

    try {
        // Verify admin token and get admin info
        const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id);

        if (!admin) {
            return res.status(401).json({ success: false, message: "Unauthorized access" });
        }

        // Check both voter and candidate pending requests
        let pendingRequest = await PendingVoterList.findOne({ requestId });
        let requestType = 'voter';

        if (!pendingRequest) {
            pendingRequest = await PendingCandidateList.findOne({ requestId });
            requestType = 'candidate';
        }

        if (!pendingRequest) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        // Only allow the requesting admin or Head Admin to view the status
        if (admin.role !== 'Head Admin' && pendingRequest.requestedBy.adminId !== admin.adminId) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        res.status(200).json({
            success: true,
            requestType,
            request: pendingRequest
        });
    } catch (error) {
        console.error("Error fetching request status:", error);
        res.status(500).json({ success: false, message: "Failed to fetch request status." });
    }
});

module.exports = router;
