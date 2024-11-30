import { useState, useContext ,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

function CreateElection() {
  const [electionName, setElectionName] = useState('');
  const [voterListName, setVoterListName] = useState('');
  const [candidateListName, setCandidateListName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [message, setMessage] = useState(null);
  const [step, setStep] = useState(1);
  const [verifiedVoterLists, setVerifiedVoterLists] = useState([]);
  const [verifiedCandidateLists, setVerifiedCandidateLists] = useState([]);
  const [description, setDescription] = useState('');
  const [availableVoterLists, setAvailableVoterLists] = useState([]);
  const [availableCandidateLists, setAvailableCandidateLists] = useState([]);
  const { admin } = useContext(AuthContext);
  const navigate = useNavigate();
  const action = "Last Action"
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const [voterResponse, candidateResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/elections/voters/all-lists'),
          axios.get('http://localhost:5000/api/elections/candidates/all-lists'),
        ]);

        setAvailableVoterLists(voterResponse.data.lists || []);
        setAvailableCandidateLists(candidateResponse.data.lists || []);
      } catch (error) {
        console.error('Error fetching available lists:', error);
        setMessage('Error loading voter and candidate lists.');
      }
    };

    fetchLists();
  }, []);

  const verifyElectionName = async () => {
    if(electionName.length < 8)
    {
      setMessage("Election Name Should be Minimum 8 letters")
      return;
    }
    if(description.length < 20)
    {
      setMessage("description Should be explain in atleast 20  letters")
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/elections/verify-name', { electionName });
      if (response.data.exists) {
        setMessage("An election with this name already exists.");
      } else {
        setMessage(null);
        setStep(2);
      }
    } catch (error) {
      console.error("Error verifying election name:", error);
      setMessage("Error verifying election name. Please try again.");
    }
  };

  const verifyVoterList = async () => {
    if (verifiedVoterLists.includes(voterListName)) {
      setMessage(`Voter list "${voterListName}" is already added.`);
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/elections/voters/check-list', { voterListName });
      if (response.data.exists) {
        setVerifiedVoterLists((prev) => [...prev, voterListName]);
        setMessage(`${action} Voter list "${voterListName}" added successfully.`);
        setVoterListName('');
      } else {
        setMessage(`No voter list found with the name "${voterListName}".`);
      }
    } catch (error) {
      console.error("Error verifying voter list:", error);
      setMessage("Error verifying voter list. Please try again.");
    }
  };

  const verifyCandidateList = async () => {
    if (verifiedCandidateLists.includes(candidateListName)) {
      setMessage(`Candidate list "${candidateListName}" is already added.`);
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/elections/candidates/check-list', { candidateListName });
      if (response.data.exists) {
        setVerifiedCandidateLists((prev) => [...prev, candidateListName]);
        setMessage(`${action} Candidate list "${candidateListName}" added successfully.`);
        setCandidateListName('');
      } else {
        setMessage("No candidate list found with this name.");
      }
    } catch (error) {
      console.error("Error verifying candidate list:", error);
      setMessage("Error verifying candidate list. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentTime = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const fiveHoursInMilliseconds = 5 * 60 * 60 * 1000;
    const fifteenHoursInMilliseconds = 15 * 60 * 60 * 1000;

  if (start - currentTime < fiveHoursInMilliseconds) {
    setMessage("The start time must be at least 5 hours from the current time.");
    return;
  }
    if (end <= start) {
      setMessage("End time must be greater than start time.");
      return;
    }

    if (end - start < fiveHoursInMilliseconds || end - start > fifteenHoursInMilliseconds) {
      setMessage('Election running time should be atleast 5 hours and atmost 15.');
      return;
    }
    if (verifiedVoterLists.length === 0) {
      setMessage("Please add at least one voter list.");
      return;
    }
    if (verifiedCandidateLists.length === 0) {
      setMessage("Please add at least one candidate list.");
      return;
    }
    const electionData = {
      electionName,
      description,
      createdBy: admin?.username || 'admin1',
      voterLists: verifiedVoterLists,
      candidateLists: verifiedCandidateLists,
      startTime,
      endTime,
      approvedBy: admin?.role === 'Head Admin' ? admin?.username : null
    };
    try {
      const endpoint = admin?.role === 'Head Admin'
        ? 'http://localhost:5000/api/elections/create'
        : 'http://localhost:5000/api/elections/submit';

      await axios.post(endpoint, electionData);
      
      setMessage(`Election "${electionName}" ${admin?.role === 'Head Admin' ? 'created' : 'submitted for approval'} successfully.`);
      setTimeout(() => navigate('/admin-dashboard'), 5000);
    } catch (error) {
      console.error("Error creating election:", error);
      setMessage("Error creating election. Please try again.");
    }
  };
  const handleBack = () => {
    if (step > 1) setStep((prevStep) => prevStep - 1);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center">
      <form className="w-full max-w-md p-10 bg-gray-800 rounded-lg" onSubmit={handleSubmit}>
        <h2 className="text-3xl text-green-500 mb-5">Create Election</h2>

        {message && (
          <div
            className={`mb-5 p-3 rounded ${
              message.includes('successfully') ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {message}
          </div>
        )}

        {/* Step 1: Enter Election Name and Description */}
        {step === 1 && (
          <div className="mb-5">
            <label htmlFor="election-name" className="text-lg">
              Election Name:
            </label>
            <input
              id="election-name"
              type="text"
              className="w-full mt-2 p-2 rounded-lg text-black"
              value={electionName}
              onChange={(e) => setElectionName(e.target.value)}
              required
            />

            <label htmlFor="description" className="text-lg mt-4 block">
              Description:
            </label>
            <textarea
              id="description"
              className="w-full mt-2 p-2 rounded-lg text-black"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              placeholder="Provide a brief description of the election"
              required
            ></textarea>

            <button
              type="button"
              onClick={verifyElectionName}
              className="mt-3 bg-blue-500 p-2 rounded-lg w-full"
            >
              Verify Election Name
            </button>
          </div>
        )}
        {/* Step 2: Add Multiple Voter Lists */}
        {step === 2 && (
          <>
            <button
              type="button"
              onClick={handleBack}
              className="bg-gray-500 p-2 rounded-lg w-full mb-3"
            >
              Back
            </button>
            <div className="mb-5">
            <div className="flex-1">
              <h3 className="text-xl text-blue-400 mb-3">Available Voter Lists:</h3>
              <ul className="list-disc pl-5 text-white max-h-40 overflow-auto border p-2 rounded mb-4">
                {availableVoterLists.map((list, index) => (
                  <li key={index}>{list}</li>
                ))}
              </ul>
            </div>
              <label htmlFor="voter-list" className="text-lg">Enter Voter List Collection Name:</label>
              <input
                id="voter-list"
                type="text"
                className="w-full mt-2 p-2 rounded-lg text-black"
                value={voterListName}
                onChange={(e) => setVoterListName(e.target.value)}
              />
              <button type="button" onClick={verifyVoterList} className="mt-3 bg-blue-500 p-2 rounded-lg w-full">
                Verify and Add Voter List
              </button>
            </div>
            <div>
              <h3 className="text-lg text-green-500">Verified Voter Lists:</h3>
              <ul className="list-disc pl-5">
                {verifiedVoterLists.map((list, index) => (
                  <li key={index} className="text-white">{list}</li>
                ))}
              </ul>
            </div>
            <button type="button" onClick={() => setStep(3)} className="mt-5 bg-green-500 p-2 rounded-lg w-full" disabled={verifiedVoterLists.length === 0}>
              Next Step
            </button>
          </>
        )}

        {/* Step 3: Add Multiple Candidate Lists */}
        {step === 3 && (
          <>
           <button
              type="button"
              onClick={handleBack}
              className="bg-gray-500 p-2 rounded-lg w-full mb-3"
            >
              Back
            </button>
            <div className="mb-5">
            <div className="flex-1">
              <h3 className="text-xl text-blue-400 mb-3">Available Candidate Lists:</h3>
              <ul className="list-disc pl-5 text-white max-h-40 overflow-auto border p-2 rounded mb-4">
                {availableCandidateLists.map((list, index) => (
                  <li key={index}>{list}</li>
                ))}
              </ul>
            </div>
              <label htmlFor="candidate-list" className="text-lg">Enter Candidate List Collection Name:</label>
              <input
                id="candidate-list"
                type="text"
                className="w-full mt-2 p-2 rounded-lg text-black"
                value={candidateListName}
                onChange={(e) => setCandidateListName(e.target.value)}
              />
              <button type="button" onClick={verifyCandidateList} className="mt-3 bg-blue-500 p-2 rounded-lg w-full">
                Verify and Add Candidate List
              </button>
            </div>
            <div>
              <h3 className="text-lg text-green-500">Verified Candidate Lists:</h3>
              <ul className="list-disc pl-5">
                {verifiedCandidateLists.map((list, index) => (
                  <li key={index} className="text-white">{list}</li>
                ))}
              </ul>
            </div>
            <button type="button" onClick={() => setStep(4)} className="mt-5 bg-green-500 p-2 rounded-lg w-full" disabled={verifiedCandidateLists.length === 0}>
              Next Step
            </button>
          </>
        )}

        {/* Step 4: Select Start and End Time */}
        {step === 4 && (
          <>
            <button
              type="button"
              onClick={handleBack}
              className="bg-gray-500 p-2 rounded-lg w-full mb-3"
            >
              Back
            </button>
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
              {admin?.role === 'Head Admin' ? 'Create Election' : 'Submit for Approval'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}

export default CreateElection;
