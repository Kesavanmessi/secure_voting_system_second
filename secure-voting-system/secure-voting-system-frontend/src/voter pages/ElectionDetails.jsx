import { useState } from 'react';
import { Link } from 'react-router-dom';

function ElectionDetails() {
  // Mock data for election details (you can replace this with actual data later)
  const [electionDetails, setElectionDetails] = useState({
    name: 'Presidential Election 2024',
    candidates: [
      { id: 1, name: 'Candidate 1', description: 'A brief description about Candidate 1.' },
      { id: 2, name: 'Candidate 2', description: 'A brief description about Candidate 2.' },
      { id: 3, name: 'Candidate 3', description: 'A brief description about Candidate 3.' },
    ],
    startTime: new Date('2024-10-01T08:00:00'), // Mock start time
    endTime: new Date('2024-10-20T18:00:00'),  // Mock end time
    isResultPublished: false, // To be updated after backend integration
  });

  // Track if the description has been read
  const [hasReadDescription, setHasReadDescription] = useState(false);
  const [canProceedToVote, setCanProceedToVote] = useState(false); // To enable voting after timeout
  const [message, setMessage] = useState('');
  
  // Current date to compare with election time
  // const currentTime = new Date();
  const isOngoing = true;
  // Logic for ongoing and finished election
  // const isOngoing = currentTime >= electionDetails.startTime && currentTime <= electionDetails.endTime;
  const isFinished = false;

  // Function to handle description reading
  const handleReadDescription = () => {
    setHasReadDescription(true); // Mark that the user has clicked the button
    setMessage('Please read the description. You will be able to vote in 10 seconds.');

    // Set a timeout to allow voting after 10 seconds
    setTimeout(() => {
      setCanProceedToVote(true);
      setMessage('You can now proceed to vote.');
    }, 10000); // 10 seconds delay
  };

  // Function to handle the voting button click
  const handleProceedToVote = () => {
    if (!canProceedToVote) {
      setMessage('Please read the description and wait for 10 seconds before voting.');
    } else {
      setMessage('');  // Clear any messages if everything is correct
    }
  };

  return (
    <div className="bg-gray-800 p-10 text-white flex flex-col items-center">
      <h1 className="text-4xl mb-8">{electionDetails.name}</h1>

      {isOngoing && !electionDetails.isResultPublished && !isFinished && (
        <div>
          {/* Display election information while it's ongoing */}
          <h2 className="text-2xl mb-4">Participating Candidates</h2>
          <ul className="list-disc mb-6">
            {electionDetails.candidates.map(candidate => (
              <li key={candidate.id} className="mb-2">
                <strong>{candidate.name}:</strong> {candidate.description}
              </li>
            ))}
          </ul>

          <div className="flex flex-col space-y-4 mb-8">
            {/* Description Button */}
            {!hasReadDescription && (
              <button
                className="bg-blue-500 hover:bg-blue-400 text-white py-2 px-4 rounded"
                onClick={handleReadDescription}
              >
                Read Description
              </button>
            )}

            {/* Description Section (after clicking Read Description) */}
            {hasReadDescription && (
              <div>
                <p className="text-lg mb-4">
                  This election is crucial for selecting the next President. Each candidate has a unique stance on various important topics like economy, healthcare, and education. Make sure to carefully consider the candidate’s profiles before casting your vote.
                </p>
              </div>
            )}

            {/* Proceed to Vote Button - Disabled until description is read and timeout has passed */}
            <Link
              to={canProceedToVote ? '/voting-page' : '#'}
              onClick={handleProceedToVote}
              className={`${
                canProceedToVote
                  ? 'bg-green-500 hover:bg-green-400'
                  : 'bg-gray-500 cursor-not-allowed'
              } text-white py-2 px-4 rounded text-center`}
            >
              Proceed to Vote
            </Link>
          </div>

          {/* Message displayed for user actions */}
          {message && (
            <p className={`text-white-400 text-lg mb-4 text-center p-1 ${message.includes("proceed")?"bg-green-500":"bg-red-500"}`}>{message}</p>
          )}
        </div>
      )}

      {isFinished && (
        <div className="text-center">
          <h2 className="text-2xl mb-4">The election has finished.</h2>
          {electionDetails.isResultPublished ? (
            <Link
              to='/voter-result'
              className="bg-yellow-500 hover:bg-yellow-400 text-white py-2 px-4 rounded"
            >
              View Result
            </Link>
          ) : (
            <p className="text-gray-400">
              The result is not yet published. Please check back later.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default ElectionDetails;
