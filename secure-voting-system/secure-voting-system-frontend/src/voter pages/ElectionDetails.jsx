import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

function ElectionDetails() {
  const { voter } = useContext(AuthContext); // Access voter details
  const [candidates, setCandidates] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [showVotingArea, setShowVotingArea] = useState(false);
  const [isResultPublished, setIsResultPublished] = useState(false);
  const [showVotingInstructions, setShowVotingInstructions] = useState(false);
  const navigate = useNavigate();

  const { electionDetails } = voter;

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await axios.post(
          'http://localhost:5000/api/elections/electionCandidates-details',
          { electionId: electionDetails.electionId }
        );

        if (response.data.success) {
          setCandidates(response.data.candidates);
        } else {
          setMessage('Failed to fetch candidates details.');
          setMessageType('error');
        }
      } catch (error) {
        console.error('Error fetching candidates details:', error);
        setMessage('Error fetching candidates details. Please try again.');
        setMessageType('error');
      }
    };

    const checkResultPublished = async () => {
      try {
        const response = await axios.post(
          'http://localhost:5000/api/elections/is-result-published',
          { electionId: electionDetails.electionId }
        );

        if (response.data.success) {
          setIsResultPublished(response.data.isPublished);
        }
      } catch (error) {
        console.error('Error checking result status:', error);
      }
    };

    fetchCandidates();
    checkResultPublished();
  }, [electionDetails.electionId]);

  const handleVoteSubmit = async () => {
    if (!selectedCandidateId) {
      setMessage('Please select a candidate to vote for.');
      setMessageType('error');
      return;
    }

    const voterName = prompt('Enter your name to confirm your vote:');
    if (!voterName) {
      setMessage('Vote confirmation cancelled.');
      setMessageType('error');
      return;
    }
    if (voter.voterName !== voterName) {
      setMessage('You entered the wrong name. Please enter the correct name shown in home.');
      setMessageType('error');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/elections/cast-vote', {
        electionId: voter.electionDetails.electionId,
        candidateId: selectedCandidateId,
        voterId: voter.voterId,
      });

      if (response.data.success) {
        setMessage(
          `Your vote for ${candidates.find((c) => c.candidateId === selectedCandidateId)?.name} has been cast successfully.`
        );
        setMessageType('success');
        setTimeout(() => navigate('/voter-login'), 4000); // Redirect after 4 seconds
      } else {
        setMessage(response.data.message || 'Failed to cast vote.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      setMessage('Error casting vote. Please try again.');
      setMessageType('error');
    }
  };

  const currentTime = new Date();
  const adjustedStartTime = new Date(new Date(electionDetails.startTime).getTime() + 1 * 60 * 1000); // +1 minute
  const endTime = new Date(electionDetails.endTime);

  const isOngoing = currentTime >= adjustedStartTime && currentTime <= endTime;
  const isFinished = currentTime > endTime;

  if (candidates.length === 0) {
    return <p className="text-white text-center">Loading candidates...</p>;
  }

  return (
    <div className="bg-gray-800 p-10 text-white flex flex-col items-center">
      <h1 className="text-4xl mb-8">{electionDetails.electionName}</h1>
      <p className="text-gray-400 text-lg mb-4">{electionDetails.description}</p>
      {!isOngoing && !isFinished && (
        <div>
          <h2 className="text-2xl mb-4">Participating Candidates</h2>
          <ul className="list-disc mb-6">
            {candidates.map((candidate) => (
              <li key={candidate.candidateId} className="mb-2">
                <strong>{candidate.name}</strong> ({candidate.party})
              </li>
            ))}
          </ul>
          <p className="text-yellow-400">The election has not started yet. Please check back later.</p>
        </div>
      )}

      {isOngoing && (
        <div>
          <p className="text-gray-400 text-lg mb-4">{electionDetails.description}</p>
          <h2 className="text-2xl mb-4">Participating Candidates</h2>
          <ul className="list-disc mb-6">
            {candidates.map((candidate) => (
              <li key={candidate.candidateId} className="mb-2">
                <strong>{candidate.name}</strong> ({candidate.party})
              </li>
            ))}
          </ul>
          <p className="text-yellow-400 mb-4">
            Click "Proceed to Vote" to start voting. You will have only **1 minute** to cast your vote after clicking
            "Proceed to vote". Be prepared!
          </p>
          {!showVotingArea && !showVotingInstructions && (
            <button
              onClick={() => {
                setMessage('');
                setShowVotingInstructions(true);
                setTimeout(() => {
                  setShowVotingInstructions(false);
                  setShowVotingArea(true);
                  setMessage('');
                }, 10000);
              }}
              className="bg-blue-500 hover:bg-blue-400 text-white py-2 px-4 rounded"
            >
              Proceed to Vote
            </button>
          )}

          {showVotingInstructions && (
            <p className="text-yellow-400 text-lg mb-4">
              How to vote: Select a candidate and confirm your vote within the voting window.
            </p>
          )}

          {showVotingArea && (
            <div className="mt-4">
              <h3 className="text-lg mb-2">Select a Candidate:</h3>
              <div className="flex flex-col space-y-4">
                {candidates.map((candidate) => (
                  <label key={candidate.candidateId} className="text-4xl cursor-pointer">
                    <input
                      type="radio"
                      name="candidate"
                      value={candidate.candidateId}
                      className="mr-4"
                      onChange={() => setSelectedCandidateId(candidate.candidateId)}
                    />
                    {candidate.name}
                  </label>
                ))}
              </div>
              <button
                onClick={handleVoteSubmit}
                className="bg-green-500 hover:bg-green-400 text-white py-2 px-4 rounded mt-4"
              >
                Confirm Vote
              </button>
            </div>
          )}
          {message && (
            <p
              className={`text-lg mt-4 p-3 rounded ${
                messageType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {message}
            </p>
          )}
        </div>
      )}

      {isFinished && (
        <div>
          <h2 className="text-2xl mb-4">The election has finished.</h2>
          {isResultPublished ? (
            <Link
              to="/voter-result"
              className="bg-yellow-500 hover:bg-yellow-400 text-white py-2 px-4 rounded"
            >
              View Result
            </Link>
          ) : (
            <p className="text-gray-400">The result is not yet published. Please check back later.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ElectionDetails;
