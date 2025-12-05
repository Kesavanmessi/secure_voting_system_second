import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

function CreateElection() {
  const [electionName, setElectionName] = useState('');
  const [description, setDescription] = useState('');
  const [voterFile, setVoterFile] = useState(null);
  const [candidateFile, setCandidateFile] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [message, setMessage] = useState(null);
  const { admin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleVoterFileChange = (e) => {
    setVoterFile(e.target.files[0]);
  };

  const handleCandidateFileChange = (e) => {
    setCandidateFile(e.target.files[0]);
  };

  const verifyElectionName = async () => {
    if (electionName.length < 8) {
      setMessage("Election Name Should be Minimum 8 letters");
      return false;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/elections/verify-name', { electionName });
      if (response.data.exists) {
        setMessage("An election with this name already exists.");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error verifying election name:", error);
      setMessage("Error verifying election name. Please try again.");
      return false;
    }
  };

  const uploadFile = async (file, listname, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('listname', listname);

    try {
      await axios.post(`http://localhost:5000/api/upload/${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return true;
    } catch (error) {
      console.error(`Error uploading ${type} list:`, error);
      setMessage(`Error uploading ${type} list: ${error.response?.data?.message || error.message}`);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (description.length < 20) {
      setMessage("Description should be at least 20 letters.");
      return;
    }

    const isNameValid = await verifyElectionName();
    if (!isNameValid && electionName.length >= 8 && !message?.includes('exists')) {
      return;
    } else if (!isNameValid) {
      return;
    }

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
      setMessage('Election running time should be at least 5 hours and at most 15.');
      return;
    }

    if (!voterFile) {
      setMessage("Please upload a voter list.");
      return;
    }
    if (!candidateFile) {
      setMessage("Please upload a candidate list.");
      return;
    }

    // Generate list names based on election name
    const voterListName = `${electionName}_voters`;
    const candidateListName = `${electionName}_candidates`;

    // Upload files
    const isVoterUploaded = await uploadFile(voterFile, voterListName, 'voters');
    if (!isVoterUploaded) return;

    const isCandidateUploaded = await uploadFile(candidateFile, candidateListName, 'candidates');
    if (!isCandidateUploaded) return;

    const electionData = {
      electionName,
      description,
      createdBy: admin?.username || 'admin1',
      voterLists: [voterListName],
      candidateLists: [candidateListName],
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
      setTimeout(() => navigate('/admin-dashboard'), 3000);
    } catch (error) {
      console.error("Error creating election:", error);
      setMessage("Error creating election. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center py-10">
      <form className="w-full max-w-2xl p-8 bg-gray-800 rounded-lg shadow-lg" onSubmit={handleSubmit}>
        <h2 className="text-3xl text-green-500 mb-6 text-center">Create Election</h2>

        {message && (
          <div className={`mb-5 p-3 rounded text-center ${message.includes('successfully') ? 'bg-green-600' : 'bg-red-600'}`}>
            {message}
          </div>
        )}

        {/* Election Details */}
        <div className="mb-6">
          <label htmlFor="election-name" className="text-lg block mb-2">Election Name:</label>
          <input
            id="election-name"
            type="text"
            className="w-full p-2 rounded-lg text-black"
            value={electionName}
            onChange={(e) => setElectionName(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="text-lg block mb-2">Description:</label>
          <textarea
            id="description"
            className="w-full p-2 rounded-lg text-black"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            placeholder="Provide a brief description..."
            required
            minLength={20}
          ></textarea>
        </div>

        {/* File Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="voter-file" className="text-lg block mb-2 text-blue-400">Upload Voter List (Excel):</label>
            <input
              id="voter-file"
              type="file"
              accept=".xlsx"
              onChange={handleVoterFileChange}
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
              required
            />
          </div>

          <div>
            <label htmlFor="candidate-file" className="text-lg block mb-2 text-blue-400">Upload Candidate List (Excel):</label>
            <input
              id="candidate-file"
              type="file"
              accept=".xlsx"
              onChange={handleCandidateFileChange}
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
              required
            />
          </div>
        </div>

        {/* Timing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label htmlFor="start-time" className="text-lg block mb-2">Start Time:</label>
            <input
              id="start-time"
              type="datetime-local"
              className="w-full p-2 rounded-lg text-black"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="end-time" className="text-lg block mb-2">End Time:</label>
            <input
              id="end-time"
              type="datetime-local"
              className="w-full p-2 rounded-lg text-black"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
          {admin?.role === 'Head Admin' ? 'Create Election' : 'Submit for Approval'}
        </button>
      </form>
    </div>
  );
}

export default CreateElection;
