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
            'candidateId': 'C1NOTA2',
            'voteCount': encryptVoteCount(0)
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
                  election.endTime,
                  voter.voterId
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
        console.log(`Election "${election.electionName}" just ended, processing results...`);

        // 1. Calculate Results
        const electionCandidates = await ElectionCandidates.findOne({ electionId: election._id });
        const electionVoters = await ElectionVoters.findOne({ electionId: election._id });

        let winnerName = 'Winner Not Available';
        let isTie = false;
        let winner = null;

        if (electionCandidates && electionCandidates.candidates) {
          // Decrypt votes
          const results = electionCandidates.candidates.map(c => ({
            candidateId: c.candidateId,
            voteCount: decryptVoteCount(c.voteCount)
          }));

          // Filter out NOTA for winner calculation if desired, or treat as regular candidate. 
          // Usually NOTA isn't a "winner" in the celebratory sense, but let's stick to simple max votes logic.

          // Find max votes
          const maxVotes = Math.max(...results.map(r => r.voteCount));

          // Find candidates with max votes
          const topCandidates = results.filter(r => r.voteCount === maxVotes);

          if (topCandidates.length > 0) {
            // Handle Tie: Randomly select one
            let winningCandidateId = topCandidates[0].candidateId;
            if (topCandidates.length > 1) {
              isTie = true;
              const randomIndex = Math.floor(Math.random() * topCandidates.length);
              winningCandidateId = topCandidates[randomIndex].candidateId;
            }

            // Fetch candidate details to get the name
            // We need to look up the candidate name from the Candidate collection 
            // However, ElectionCandidates only has IDs. We need to iterate through the election's candidate lists.

            const candidateLists = election.candidateLists || [];
            // We likely need to fetch all candidate lists to find the name
            const candidateListsDocs = await Candidate.find({ listname: { $in: candidateLists } });

            // Create a map for quick lookup
            const candidateMap = new Map();
            candidateListsDocs.forEach(list => {
              list.candidates.forEach(c => candidateMap.set(c.candidateId, c));
            });
            // Add NOTA manually if needed, though usually it has a fixed name
            candidateMap.set('C1NOTA2', { candidateName: 'NOTA (None of the Above)', name: 'NOTA' });

            const winnerDetails = candidateMap.get(winningCandidateId);

            if (winnerDetails) {
              winner = winnerDetails;
              winnerName = winnerDetails.candidateName || winnerDetails.name || 'Unknown Candidate';
            }
          }
        }

        // 2. Update Election Document (Persist Result)
        // Also mark result as published automatically so users can see it immediately
        election.winner = winner;
        election.isTie = isTie;
        election.isResultPublished = true;
        await election.save();

        console.log(`Election processed. Winner: ${winnerName} (Tie: ${isTie})`);

        // 3. Send Notifications
        const voterLists = election.voterLists || [];
        const voterListPromises = voterLists.map(listName => Voter.findOne({ listname: listName }));
        const voterListsData = await Promise.all(voterListPromises);

        for (const voterList of voterListsData) {
          if (voterList) {
            for (const voter of voterList.voters) {
              await sendElectionEndEmail(
                voter.email,
                voter.voterName,
                election.electionName,
                winnerName,
                isTie
              ).catch(err => console.error(`Failed to send end email to ${voter.email}:`, err));
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
