import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CreateElection() {
  const [electionName, setElectionName] = useState('');
  const [voterListName, setVoterListName] = useState('');
  const [candidateListName, setCandidateListName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [message, setMessage] = useState(null);
  const [step, setStep] = useState(1);  // Track current step
  const navigate = useNavigate();

  // Step 1: Verify if Election Name is Unique
  const verifyElectionName = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/elections/verify-name', { electionName });
      if (response.data.exists) {
        setMessage("An election with this name already exists.");
      } else {
        setMessage(null);
        setStep(2); // Move to Step 2 after successful verification
      }
    } catch (error) {
      console.error("Error verifying election name:", error);
      setMessage("Error verifying election name. Please try again.");
    }
  };

  // Step 2: Verify if Voter List Exists in the voters database
  const verifyVoterList = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/elections/voters/check-list', { voterListName });
      if (response.data.exists) {
        setMessage(`Voter list "${voterListName}" added successfully.`);
        setStep(3);  // Move to Step 3
      } else {
        setMessage(`No voter list found with the name "${voterListName}".`);
      }
    } catch (error) {
      console.error("Error fetching voters:", error);
      setMessage("Error fetching voters. Please try again.");
    }
  };

  // Step 3: Verify if Candidate List Exists in the candidates database
  const verifyCandidateList = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/elections/candidates/check-list', { candidateListName });
      if (response.data.exists) {
        setMessage(`Candidate list "${candidateListName}" verified successfully.`);
        setStep(4);  // Move to Step 4
      } else {
        setMessage("No candidate list found with this name.");
      }
    } catch (error) {
      console.error("Error verifying candidate list:", error);
      setMessage("Error verifying candidate list. Please try again.");
    }
  };

  // Step 4: Handle Final Submission and Time Validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      setMessage("End time must be greater than start time.");
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/elections/create', {
        electionName,
        createdBy: 'admin1',  // Use dynamic admin ID if available
        voterListName,
        candidateListName,
        startTime,
        endTime
      });

      setMessage(`Election "${electionName}" created successfully.`);
      setTimeout(() => navigate('/admin-dashboard'), 5000);
    } catch (error) {
      console.error("Error creating election:", error);
      setMessage("Error creating election. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center">
      <form className="w-full max-w-md p-10 bg-gray-800 rounded-lg" onSubmit={handleSubmit}>
        <h2 className="text-3xl text-green-500 mb-5">Create Election</h2>

        {message && (
          <div className={`mb-5 p-3 rounded ${message.includes("successfully") ? "bg-green-600" : "bg-red-600"}`}>
            {message}
          </div>
        )}

        {/* Step 1: Enter Election Name */}
        {step === 1 && (
          <div className="mb-5">
            <label htmlFor="election-name" className="text-lg">Election Name:</label>
            <input
              id="election-name"
              type="text"
              className="w-full mt-2 p-2 rounded-lg text-black"
              value={electionName}
              onChange={(e) => setElectionName(e.target.value)}
              required
            />
            <button type="button" onClick={verifyElectionName} className="mt-3 bg-blue-500 p-2 rounded-lg w-full">
              Verify Election Name
            </button>
          </div>
        )}

        {/* Step 2: Verify Voter List */}
        {step === 2 && (
          <div className="mb-5">
            <label htmlFor="voter-list" className="text-lg">Voter List Collection Name:</label>
            <input
              id="voter-list"
              type="text"
              className="w-full mt-2 p-2 rounded-lg text-black"
              value={voterListName}
              onChange={(e) => setVoterListName(e.target.value)}
              required
            />
            <button type="button" onClick={verifyVoterList} className="mt-3 bg-blue-500 p-2 rounded-lg w-full">
              Verify Voter List
            </button>
          </div>
        )}

        {/* Step 3: Verify Candidate List */}
        {step === 3 && (
          <div className="mb-5">
            <label htmlFor="candidate-list" className="text-lg">Candidate List Collection Name:</label>
            <input
              id="candidate-list"
              type="text"
              className="w-full mt-2 p-2 rounded-lg text-black"
              value={candidateListName}
              onChange={(e) => setCandidateListName(e.target.value)}
              required
            />
            <button type="button" onClick={verifyCandidateList} className="mt-3 bg-blue-500 p-2 rounded-lg w-full">
              Verify Candidate List
            </button>
          </div>
        )}

        {/* Step 4: Select Start and End Time */}
        {step === 4 && (
          <>
            <div className="mb-5">
              <label htmlFor="start-time" className="text-lg">Start Time:</label>
              <input
                id="start-time"
                type="datetime-local"
                className="w-full mt-2 p-2 rounded-lg text-black"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="mb-5">
              <label htmlFor="end-time" className="text-lg">End Time:</label>
              <input
                id="end-time"
                type="datetime-local"
                className="w-full mt-2 p-2 rounded-lg text-black"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="w-full bg-green-500 p-2 mt-5 rounded-lg">
              Create Election
            </button>
          </>
        )}
      </form>
    </div>
  );
}

export default CreateElection;
