import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ManageSingleElection({ elections, updateElection }) {
  const { id } = useParams();  // Get the election ID from the route params
  const navigate = useNavigate();

  const election = elections.find(e => e.id === parseInt(id));  // Find the election by ID
  const [electionName, setElectionName] = useState(election?.name || '');
  const [startTime, setStartTime] = useState(election?.startTime || '');
  const [endTime, setEndTime] = useState(election?.endTime || '');
  const [voters, setVoters] = useState(election?.voters || []);
  const [candidates, setCandidates] = useState(election?.candidates || []);
  const [message, setMessage] = useState("");

  const handleUpdateElection = () => {
    if (!electionName || voters.length === 0 || candidates.length === 0) {
      setMessage("Please fill in all fields and ensure voters and candidates are added.");
      return;
    }

    updateElection({
      id: election.id,
      name: electionName,
      startTime,
      endTime,
      voters,
      candidates,
    });

    setMessage(`Election "${electionName}" updated successfully.`);
    setTimeout(() => {
      navigate('/admin-dashboard/manage-election');  // Redirect back to manage page
    }, 5000);
  };

  // Function to add/remove voters and candidates (for simplicity, use a list input)
  const handleAddVoter = (voter) => setVoters([...voters, voter]);
  const handleRemoveVoter = (index) => setVoters(voters.filter((_, i) => i !== index));
  const handleAddCandidate = (candidate) => setCandidates([...candidates, candidate]);
  const handleRemoveCandidate = (index) => setCandidates(candidates.filter((_, i) => i !== index));

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-4xl mb-5 text-green-400">Manage Election: {election?.name}</h1>
      
      {/* Success/Error Message */}
      {message && <div className="bg-green-500 text-white p-4 rounded mb-4">{message}</div>}
      
      {/* Election Name */}
      <div className="mb-5">
        <label className="text-xl">Election Name:</label>
        <input
          type="text"
          value={electionName}
          onChange={(e) => setElectionName(e.target.value)}
          className="p-2 text-black rounded ml-2"
        />
      </div>
      
      {/* Election Start and End Time */}
      <div className="mb-5">
        <label className="text-xl">Start Time:</label>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="p-2 text-black rounded ml-2"
        />
        <label className="text-xl">End Time:</label>
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="p-2 text-black rounded ml-2"
        />
      </div>
      
      {/* Voters Section */}
      <div className="mb-5">
        <h2 className="text-2xl mb-3">Voters</h2>
        {voters.map((voter, index) => (
          <div key={index} className="flex items-center mb-2">
            <p className="mr-4">{voter}</p>
            <button onClick={() => handleRemoveVoter(index)} className="bg-red-500 text-white px-2 py-1 rounded">Remove</button>
          </div>
        ))}
        <button onClick={() => handleAddVoter(prompt("Enter new voter name"))} className="bg-blue-500 text-white px-4 py-2 rounded">Add Voter</button>
      </div>

      {/* Candidates Section */}
      <div className="mb-5">
        <h2 className="text-2xl mb-3">Candidates</h2>
        {candidates.map((candidate, index) => (
          <div key={index} className="flex items-center mb-2">
            <p className="mr-4">{candidate}</p>
            <button onClick={() => handleRemoveCandidate(index)} className="bg-red-500 text-white px-2 py-1 rounded">Remove</button>
          </div>
        ))}
        <button onClick={() => handleAddCandidate(prompt("Enter new candidate name"))} className="bg-blue-500 text-white px-4 py-2 rounded">Add Candidate</button>
      </div>

      {/* Save Button */}
      <button
        onClick={handleUpdateElection}
        className="bg-green-500 text-white px-4 py-2 rounded">
        Save Changes
      </button>
    </div>
  );
}

export default ManageSingleElection;
