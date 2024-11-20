import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

function ElectionDetails() {
  const { voter } = useContext(AuthContext); // Access voter details
  const [candidates, setCandidates] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [hasReadDescription, setHasReadDescription] = useState(false);
  const [canProceedToVote, setCanProceedToVote] = useState(false);
  const [isResultPublished, setIsResultPublished] = useState(false);
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
        }
      } catch (error) {
        console.error('Error fetching candidates details:', error);
        setMessage('Error fetching candidates details. Please try again.');
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

  const handleReadDescription = () => {
    setHasReadDescription(true);
    setMessage('Please read the description. You will be able to vote in 10 seconds.');

    setTimeout(() => {
      setCanProceedToVote(true);
      setMessage('You can now proceed to vote.');
    }, 10000); // 10 seconds delay
  };

  const handleVoteSubmit = async () => {
    if (!selectedCandidateId) {
      setMessage('Please select a candidate to vote for.');
      return;
    }
    console.log(voter.electionDetails.electionId , voter.voterId , selectedCandidateId);
    try {
      const response = await axios.post('http://localhost:5000/api/elections/cast-vote', {
        electionId: voter.electionDetails.electionId,
        candidateId: selectedCandidateId,
        voterId: voter.voterId,
      });

      if (response.data.success) {
        setMessage('Vote cast successfully!');
        navigate('/voter-dashboard'); // Redirect after successful voting
      } else {
        setMessage(response.data.message || 'Failed to cast vote.');
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      setMessage('Error casting vote. Please try again.');
    }
  };

  const currentTime = new Date();
  const startTime = new Date(electionDetails.startTime);
  const endTime = new Date(electionDetails.endTime);

  const isOngoing = currentTime >= startTime && currentTime <= endTime;
  const isFinished = currentTime > endTime;

  if (candidates.length === 0) {
    return <p className="text-white text-center">Loading candidates...</p>;
  }

  return (
    <div className="bg-gray-800 p-10 text-white flex flex-col items-center">
      <h1 className="text-4xl mb-8">{electionDetails.electionName}</h1>

      {!isOngoing && !isFinished && (
        <p className="text-gray-400 text-lg">The election has not started yet. Please check back later.</p>
      )}

      {isOngoing && (
        <div>
          <h2 className="text-2xl mb-4">Participating Candidates</h2>
          <ul className="list-disc mb-6">
            {candidates.map((candidate) => (
              <li
                key={candidate.candidateId}
                className={`mb-2 cursor-pointer ${
                  selectedCandidateId === candidate.candidateId
                    ? 'text-green-400'
                    : 'text-white'
                }`}
                onClick={() => setSelectedCandidateId(candidate.candidateId)}
              >
                <strong>{candidate.name}</strong> ({candidate.party})
              </li>
            ))}
          </ul>

          <div className="flex flex-col space-y-4 mb-8">
            {!hasReadDescription && (
              <button
                className="bg-blue-500 hover:bg-blue-400 text-white py-2 px-4 rounded"
                onClick={handleReadDescription}
              >
                Read Description
              </button>
            )}

            {hasReadDescription && (
              <div>
                <p className="text-lg mb-4">
                  This election is crucial for selecting the next leader. Carefully consider the
                  candidates' profiles before casting your vote.
                </p>
              </div>
            )}

            {canProceedToVote ? (
              <button
                onClick={handleVoteSubmit}
                className="bg-green-500 hover:bg-green-400 text-white py-2 px-4 rounded"
              >
                Confirm and Cast Vote
              </button>
            ) : (
              <p className="text-gray-400">You need to read the description before casting your vote.</p>
            )}
          </div>

          {message && (
            <p
              className={`text-white-400 text-lg mb-4 text-center p-1 ${
                message.includes('successfully') ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {message}
            </p>
          )}
        </div>
      )}

      {isFinished && (
        <div className="text-center">
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
