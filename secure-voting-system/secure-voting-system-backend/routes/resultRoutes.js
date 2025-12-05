const express = require('express');
const router = express.Router();
const Election = require('../models/Election');
const ElectionEnded = require('../models/ElectionEnded');
const ElectionVoters = require('../models/ElectionVoters');
const ElectionCandidates = require('../models/ElectionCandidates');
const Candidate = require('../models/Candidates');
const VoteLog = require('../models/VoteLog');
const { decryptVoteCount } = require('../utils/encryption');

// Fetch finished elections
router.get('/finished', async (req, res) => {
    try {
        const finishedElections = await Election.find({
            endTime: { $lt: new Date() }
        }).sort({ endTime: -1 });
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
            const { candidateId, ...otherInfo } = candidateInfo || {};
            return {
                ...otherInfo,
                candidateId: candidate.candidateId,
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
                const { candidateId, ...otherDetails } = candidateDetails || {};
                return {
                    ...otherDetails,
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
            VoteLog.deleteMany({ electionId })
        ]);

        res.status(200).json({ success: true, message: 'Election moved to finished successfully.' });
    } catch (error) {
        console.error('Error moving election to finished:', error);
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

module.exports = router;
