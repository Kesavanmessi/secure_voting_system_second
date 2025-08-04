const cron = require('node-cron');
const Election = require('./models/Election');
const Voter = require('./models/Voters');
const Candidate = require('./models/Candidates');
const ElectionVoters = require('./models/ElectionVoters');
const ElectionCandidates = require('./models/ElectionCandidates');
const { encryptVoteCount } = require('./utils/encryption');
const { 
  sendElectionCreationEmail, 
  sendElectionStartEmail, 
  sendElectionEndEmail 
} = require('./utils/emailService');

// Scheduler logic
const startScheduler = () => {
  cron.schedule('* * * * *', async () => {
    console.log('Running scheduled job...');
    try {
      const now = new Date();
  
      // Find elections that need population
      const electionsToPopulate = await Election.find({
        startTime: { $lte: now },
        isPopulated: false,
      });
  
      for (const election of electionsToPopulate) {
        console.log(`Processing election: ${election.electionName}`);
        const existingVoterDocument = await ElectionVoters.findOne({ electionId: election._id });
        const existingCandidateDocument = await ElectionCandidates.findOne({ electionId: election._id });
        
        if (!existingVoterDocument) {
          // Populate ElectionVoters
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
            
            // Send election creation emails to all voters
            for (const voterList of voterListsData) {
              if (voterList) {
                for (const voter of voterList.voters) {
                  await sendElectionCreationEmail(
                    voter.email,
                    voter.voterName,
                    election.electionName,
                    voter.voterId,
                    voter.password // Add the random password
                  );
                }
              }
            }
          }
        } else {
          console.log(`Voters already populated for election: ${election.electionName}`);
        }
        
        if (!existingCandidateDocument) {
          // Populate ElectionCandidates
          const candidateLists = election.candidateLists || [];
          const candidateListPromises = candidateLists.map(listName => Candidate.findOne({ listname: listName }));
          const candidateListsData = await Promise.all(candidateListPromises);
  
          const candidatesToAdd = candidateListsData.reduce((acc, list) => {
            if (list) acc.push(...list.candidates.map(candidate => ({
              candidateId: candidate.candidateId,
              voteCount: encryptVoteCount(0),
            })));
            return acc;
          }, []);
           candidatesToAdd.push({
            'candidateId':'C1NOTA2',
            'voteCount':encryptVoteCount(0)
           })
           const uniqueCandidates = Array.from(
            new Map(candidatesToAdd.map(candidate => [candidate.candidateId, candidate])).values()
          );
          if (uniqueCandidates.length > 0) {
            await new ElectionCandidates({
              electionId: election._id,
              candidates: uniqueCandidates,
            }).save();
            console.log(`Candidates populated for election: ${election.electionName}`);
          }
        } else {
          console.log(`Candidates already populated for election: ${election.electionName}`);
        }
  
        // Mark election as populated only if both voters and candidates are populated
        const voterDocumentExists = await ElectionVoters.findOne({ electionId: election._id });
        const candidateDocumentExists = await ElectionCandidates.findOne({ electionId: election._id });
        if (voterDocumentExists && candidateDocumentExists) {
          election.isPopulated = true;
          await election.save();
          console.log(`Election "${election.electionName}" marked as populated.`);
          
          // Send election start notification emails
          const voterLists = election.voterLists || [];
          const voterListPromises = voterLists.map(listName => Voter.findOne({ listname: listName }));
          const voterListsData = await Promise.all(voterListPromises);
          
          for (const voterList of voterListsData) {
            if (voterList) {
              for (const voter of voterList.voters) {
                await sendElectionStartEmail(
                  voter.email,
                  voter.voterName,
                  election.electionName,
                  election.startTime,
                  election.endTime
                );
              }
            }
          }
        }
      }

      // Check for elections that just ended and send end notifications
      const electionsJustEnded = await Election.find({
        endTime: { 
          $gte: new Date(now.getTime() - 60000), // Within last minute
          $lte: now 
        },
        isPopulated: true
      });

      for (const election of electionsJustEnded) {
        console.log(`Election "${election.electionName}" just ended, sending notifications...`);
        
        // Send election end notification emails
        const voterLists = election.voterLists || [];
        const voterListPromises = voterLists.map(listName => Voter.findOne({ listname: listName }));
        const voterListsData = await Promise.all(voterListPromises);
        
        for (const voterList of voterListsData) {
          if (voterList) {
            for (const voter of voterList.voters) {
              await sendElectionEndEmail(
                voter.email,
                voter.voterName,
                election.electionName
              );
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in scheduled job:', error.message);
    }
  });
  
};

module.exports = startScheduler;
