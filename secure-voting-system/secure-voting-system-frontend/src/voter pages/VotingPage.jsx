import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function VotingPage() {
  const navigate = useNavigate();

  // Mock candidates (replace this with actual data from your backend)
  const candidates = [
    { id: 1, name: 'Candidate 1' },
    { id: 2, name: 'Candidate 2' },
    { id: 3, name: 'Candidate 3' },
  ];

  const [selectedCandidate, setSelectedCandidate] = useState(null);  // Holds the selected candidate
  const [voteConfirmed, setVoteConfirmed] = useState(false);        // Controls if vote is confirmed
  const [voteSubmitted, setVoteSubmitted] = useState(false);        // Controls if vote is submitted

  // Function to handle radio selection
  const handleSelection = (event) => {
    setSelectedCandidate(event.target.value);
  };

  // Function to go back to candidate selection
  const handleBack = () => {
    setVoteConfirmed(false);
  };

  // Function to confirm vote
  const handleVoteConfirmation = () => {
    setVoteConfirmed(true);
  };

  // Function to submit the vote
  const handleVoteSubmission = () => {
    setVoteSubmitted(true);

    // Simulate vote submission and redirection
    setTimeout(() => {
      navigate('/voter-login');  // Redirect to voter login after 5 seconds
    }, 5000);
  };

  return (
    <div className="bg-gray-900 text-white p-10 flex flex-col items-center min-h-screen">
      <h1 className="text-4xl text-green-400 mb-8">Vote for a Candidate</h1>

      {/* Candidate Selection */}
      {!voteConfirmed && !voteSubmitted && (
        <form className="flex flex-col items-center">
          <div className="mb-6">
            {candidates.map((candidate) => (
              <label key={candidate.id} className="block mb-4 text-yellow-300">
                <input
                  type="radio"
                  name="candidate"
                  value={candidate.name}
                  onChange={handleSelection}
                  className="mr-2"
                />
                {candidate.name}
              </label>
            ))}
          </div>

          {selectedCandidate && (
            <button
              type="button"
              onClick={handleVoteConfirmation}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400"
            >
              Submit
            </button>
          )}
        </form>
      )}

      {/* Confirmation step */}
      {voteConfirmed && !voteSubmitted && (
        <div className="text-center">
          <h2 className="text-2xl text-yellow-400 mb-6">
            You have chosen: <span className="font-bold">{selectedCandidate}</span>
          </h2>
          <p className="mb-4 text-gray-300">Please confirm your vote or go back to change your selection.</p>
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleVoteSubmission}
              className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Success message and redirection */}
      {voteSubmitted && (
        <div className="text-center">
          <h2 className="text-2xl text-green-500 mb-6">Your vote for <span className="font-bold">{selectedCandidate}</span> has been successfully added!</h2>
          <p className="text-gray-400">Redirecting to the login page in 5 seconds...</p>
        </div>
      )}
    </div>
  );
}

export default VotingPage;
