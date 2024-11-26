import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

function ManageSingleElection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { admin } = useContext(AuthContext);

  const role = admin.role;
  const [election, setElection] = useState({});
  const [electionName, setElectionName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [voters, setVoters] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [deletionList, setDeletionList] = useState({ voters: [], candidates: [] });
  const [newVoter, setNewVoter] = useState('');
  const [newCandidate, setNewCandidate] = useState('');
  const [isElectionNameVerified, setIsElectionNameVerified] = useState(false);
  const [description, setDescription] = useState('');


  useEffect(() => {
    const fetchElectionData = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/elections/one/${id}`);
        setElection(data);
        setElectionName(data.electionName);
        setDescription(data.description); 
        setStartTime(data.startTime);
        setEndTime(data.endTime);
        setVoters(data.voterLists);
        setCandidates(data.candidateLists);
        setIsElectionNameVerified(true);
      } catch (error) {
        console.error("Error fetching election data:", error);
        setMessage("Error fetching election data.");
        setMessageType("error");
      }
    };
    fetchElectionData();
  }, [id]);


  const verifyElectionName = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/elections/verify-name', { electionName });
      if (!response.data.exists) {
        setIsElectionNameVerified(true);
        setMessage("Election name is available.");
        setMessageType("success");
      } else {
        setMessage(`The election name "${electionName}" is already taken.`);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error verifying election name:", error);
      setMessage("Error verifying election name.");
      setMessageType("error");
    }
  };



  const handleAddVoter = async () => {
    if (!newVoter) {
      alert('Please enter a voter list name.');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/elections/searchvoterLists/${newVoter}`);
      if (response.data.exists) {
        if (!voters.includes(newVoter)) {
          setVoters([...voters, newVoter]);
          setMessage(`${newVoter} added to the election voter list.`);
          setMessageType("success");
          setNewVoter('');
        } else {
          setMessage(`${newVoter} is already in the election voter list.`);
          setMessageType("error");
        }
      } else {
        setMessage(`${newVoter} is not a valid voter list`);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error adding voter:", error);
      setMessage("Error adding voter.");
      setMessageType("error");
    }
  };

  const handleAddCandidate = async () => {
    if (!newCandidate) {
      alert('Please enter a candidate list name.');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/elections/searchCandidateLists/${newCandidate}`);
      if (response.data.exists) {
        if (!candidates.includes(newCandidate)) {
          setCandidates([...candidates, newCandidate]);
          setMessage(`${newCandidate} added to the election candidate list.`);
          setMessageType("success");
          setNewCandidate('');
        } else {
          setMessage(`${newCandidate} is already in the election candidate list.`);
          setMessageType("error");
        }
      } else {
        setMessage(`${newCandidate} is not a valid candidate list.`);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error adding candidate:", error);
      setMessage("Error adding candidate.");
      setMessageType("error");
    }
  };


  const handleVoterDeletionToggle = (voter) => {
    setDeletionList((prev) => ({
      ...prev,
      voters: prev.voters.includes(voter)
        ? prev.voters.filter((v) => v !== voter)
        : [...prev.voters, voter],
    }));
  };

  const handleCandidateDeletionToggle = (candidate) => {
    setDeletionList((prev) => ({
      ...prev,
      candidates: prev.candidates.includes(candidate)
        ? prev.candidates.filter((c) => c !== candidate)
        : [...prev.candidates, candidate],
    }));
  };

  const handleDeleteSelectedLists = async () => {
    if (deletionList.voters.length === voters.length) {
      setMessage("Election must have at least one voter list.");
      setMessageType("error");
      return;
    }
    if (deletionList.candidates.length === candidates.length) {
      setMessage("Election must have at least one candidate list.");
      setMessageType("error");
      return;
    }

    try {
      if (role === 'Head Admin') {
        // Directly delete selected lists if Head Admin
        const updatedVoters = voters.filter((v) => !deletionList.voters.includes(v));
        const updatedCandidates = candidates.filter((c) => !deletionList.candidates.includes(c));
        
        await Promise.all(deletionList.voters.map(voter => 
          axios.delete(`http://localhost:5000/api/elections/${id}/list`, {
            data: { listName: voter, listType: 'voterLists' }
          })
        ));
        await Promise.all(deletionList.candidates.map(candidate => 
          axios.delete(`http://localhost:5000/api/elections/${id}/list`, {
            data: { listName: candidate, listType: 'candidateLists' }
          })
        ));

        setVoters(updatedVoters);
        setCandidates(updatedCandidates);
        setMessage("Selected lists deleted successfully.");
        setMessageType("success");
        setDeletionList({ voters: [], candidates: [] });
      } else {
        // For other admins, submit modification request
        const updatedVoters = voters.filter((v) => !deletionList.voters.includes(v));
        const updatedCandidates = candidates.filter((c) => !deletionList.candidates.includes(c));

        const modificationRequest = {
          electionId: id,
          updatedFields: {
            electionName,
            startTime,
            description,
            endTime,
            voterLists: updatedVoters,
            candidateLists: updatedCandidates
          },
          modifiedBy: admin.username,
        };

        await axios.post('http://localhost:5000/api/elections/request-modification', modificationRequest);
        setMessage("Modification request submitted for approval.");
        setMessageType("success");
      }
    } catch (error) {
      console.error("Error processing deletions:", error);
      setMessage("An error occurred while processing deletions.");
      setMessageType("error");
    }
  };

  const handleUpdateElection = async () => {
    if (startTime > endTime) {
      setMessage("End time should be greater than start time.");
      setMessageType("error");
      return;
    }
    if(!isElectionNameVerified)
    {
      setMessage("As you are  Modified the Election Name But not verified it please verify the election name");
      setMessageType("error");
      return;
    }
    const confirmUpdate = (role === 'Head Admin') ? window.confirm("Are you sure you want to save the changes?") : window.confirm("Are you sure you want to submit for the changes?")
    if (!confirmUpdate) return;
    try {
      if (role === 'Head Admin') {
        const updateData = {
          electionName,
          startTime,
          endTime,
          voters,
          candidates,
          modifiedBy: admin.username,
        };
        await axios.put(`http://localhost:5000/api/elections/one/${id}`, updateData);
        setMessage(`Election "${electionName}" updated successfully.`);
        setMessageType("success");
      } else {
        handleDeleteSelectedLists();
        setMessage("Your modifications have been submitted for approval.");
        setMessageType("success");
      }
      setTimeout(() => navigate('/admin-dashboard/manage-election'), 3000);
    } catch (error) {
      console.error("Error updating election:", error);
      setMessage("Error updating election. Please try again.");
      setMessageType("error");
    }
  };



  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-4xl mb-5 text-green-400">Manage Election: {election?.electionName}</h1>
      {message && (
        <div className={`p-4 rounded mb-4 ${messageType === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {message}
        </div>
      )}

      {/* Election Name Section */}
      <div className="mb-5 flex items-center">
        <label className="text-xl mr-2">New Election Name :</label>
        <input
          type="text"
          value={electionName}
          onChange={(e) => {
            setElectionName(e.target.value);
            setIsElectionNameVerified(false); // Reset verification status when name changes
          }}
          className="p-2 text-black rounded"
        />
        <button onClick={verifyElectionName} className="bg-blue-500 text-white px-4 py-2 ml-2 rounded">Verify</button>
      </div>
      <div className="mb-5">
  <label className="text-xl">Description:</label>
  <textarea
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    className="w-full mt-2 p-2 text-black rounded"
    rows="5"
    placeholder="Enter election description"
  ></textarea>
</div>

      {/* Start Time, End Time, Voters, Candidates Sections go here */}
      <div className="mb-5">
    <label className="text-xl">Start Time:</label>
    <input
      type="datetime-local"
      value={startTime}
      onChange={(e) => setStartTime(e.target.value)}
      className="p-2 text-black rounded ml-2"
    />
    <label className="text-xl ml-4">End Time:</label>
    <input
      type="datetime-local"
      value={endTime}
      onChange={(e) => setEndTime(e.target.value)}
      className="p-2 text-black rounded ml-2"
    />
  </div>

  <div className="mb-5">
    <h2 className="text-2xl mb-3">Voters List (Select to Remove)</h2>
    {voters.map((voter, index) => (
      <div key={index} className="flex items-center mb-2">
        <input
          type="checkbox"
          checked={deletionList.voters.includes(voter)}
          onChange={() => handleVoterDeletionToggle(voter)}
          className="mr-2"
        />
        <span>{voter}</span>
      </div>
    ))}
    <div className="flex items-center mt-3">
      <input
        type="text"
        value={newVoter}
        onChange={(e) => setNewVoter(e.target.value)}
        placeholder="Add new voter List"
        className="p-2 text-black rounded mr-2"
      />
      <button
        onClick={handleAddVoter}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Add Voter List
      </button>
    </div>
  </div>

  <div className="mb-5">
    <h2 className="text-2xl mb-3">Candidates List (Select to Remove)</h2>
    {candidates.map((candidate, index) => (
      <div key={index} className="flex items-center mb-2">
        <input
          type="checkbox"
          checked={deletionList.candidates.includes(candidate)}
          onChange={() => handleCandidateDeletionToggle(candidate)}
          className="mr-2"
        />
        <span>{candidate}</span>
      </div>
    ))}
    <div className="flex items-center mt-3">
      <input
        type="text"
        value={newCandidate}
        onChange={(e) => setNewCandidate(e.target.value)}
        placeholder="Add new candidate List"
        className="p-2 text-black rounded mr-2"
      />
      <button
        onClick={handleAddCandidate}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Add Candidate List
      </button>
    </div>
  </div>
  
      {/* Update and Delete Buttons */}
      <button
        onClick={handleUpdateElection}
        className="bg-yellow-500 text-white px-4 py-2 rounded"
      >
        {role === 'Head Admin' ? 'Update Election' : 'Submit for Modification'}
      </button>

      {/* Show Delete Button Only for Head Admin */}
      {admin.role === 'Head Admin' && (
        <button
          onClick={handleDeleteSelectedLists}
          className="bg-red-500 text-white px-4 py-2 rounded ml-4"
        >
          Delete Selected Voters/Candidates
        </button>
      )}
    </div>
  );
}

export default ManageSingleElection;
