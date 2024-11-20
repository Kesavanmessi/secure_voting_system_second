const cron = require('node-cron');
const Election = require('./models/Election');
const Voter = require('./models/Voters');
const Candidate = require('./models/Candidates');
const ElectionVoters = require('./models/ElectionVoters');
const ElectionCandidates = require('./models/ElectionCandidates');
const { encryptVoteCount } = require('./utils/encryption');

// Scheduler logic
const startScheduler = () => {
  cron.schedule('* * * * *', async () => {
    console.log('Running scheduled job...');
    try {
      const now = new Date();

      // Find elections that need population (startTime <= now, isPopulated = false)
      const electionsToPopulate = await Election.find({
        startTime: { $lte: now },
        isPopulated: false,
      });

      for (const election of electionsToPopulate) {
        console.log(`Processing election: ${election.electionName}`);

        // Check if voters have already been populated
        const existingVoterDocument = await ElectionVoters.findOne({ electionId: election._id });

        const existingCandidateDocument = await ElectionCandidates.findOne({ electionId: election._id });

        if (!existingVoterDocument && !existingCandidateDocument) {
          // Populate ElectionVoters if not already populated
          const voterLists = election.voterLists || [];
          const voterListPromises = voterLists.map(listName => Voter.findOne({ listname: listName }));
          const voterListsData = await Promise.all(voterListPromises);

          const votersToAdd = voterListsData.reduce((acc, list) => {
            if (list) acc.push(...list.voters.map(v => ({ voterId: v.voterId })));
            return acc;
          }, []);

          const uniqueVoters = Array.from(new Map(votersToAdd.map(v => [v.voterId, v])).values());
          if (uniqueVoters.length > 0) {
            await new ElectionVoters({
              electionId: election._id,
              voters: uniqueVoters,
            }).save();
            console.log(`Voters populated for election: ${election.electionName}`);
          }

        // Fetch and add candidates (same approach as for voters)
        const candidateLists = election.candidateLists || []; // Get the list of candidate lists
        const candidateListPromises = candidateLists.map(listName => Candidate.findOne({ listname: listName })); // Fetch each candidate list
        const candidateListsData = await Promise.all(candidateListPromises);

        const candidatesToAdd = candidateListsData.reduce((acc, list) => {
          if (list) acc.push(...list.candidates.map(candidate => ({
            candidateId: candidate.candidateId,
            voteCount: encryptVoteCount(0), // Initialize vote count to 0 (encrypted)
          })));
          return acc;
        }, []);
        console.log(candidatesToAdd);
        if (candidatesToAdd.length > 0) {
          await new ElectionCandidates({
            electionId: election._id,
            candidates: candidatesToAdd,
          }).save();
        }

        // Mark election as populated
        election.isPopulated = true;
        await election.save();
        console.log(`Election "${election.electionName}" marked as populated.`);
      }
      else {
        console.log(`Voters already populated for election: ${election.electionName}`);
      }}
    } catch (error) {
      console.error('Error in scheduled job:', error.message);
    }
  });
};

module.exports = startScheduler;
