import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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

    // Basic Validation
    if (description.length < 20) {
      setMessage("Description should be at least 20 letters.");
      return;
    }

    // Name Verification
    const isNameValid = await verifyElectionName();
    if (!isNameValid) return; // verifyElectionName sets the message

    // Date Validation
    const currentTime = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    const fiveHoursInMilliseconds = 5 * 60 * 60 * 1000;
    const fifteenHoursInMilliseconds = 15 * 60 * 60 * 1000;

    // if (start - currentTime < fiveHoursInMilliseconds) {
    //   setMessage("The start time must be at least 5 hours from the current time.");
    //   return;
    // }
    // if (end <= start) {
    //   setMessage("End time must be greater than start time.");
    //   return;
    // }
    // if (end - start < fiveHoursInMilliseconds || end - start > fifteenHoursInMilliseconds) {
    //   setMessage('Election running time should be at least 5 hours and at most 15.');
    //   return;
    // }

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
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 sm:p-10">

          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">Create Election</h2>
            <p className="text-slate-400">Set up a new secure election event</p>
          </div>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-6 p-4 rounded-xl border ${message.includes('successfully') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
              >
                <div className="flex items-center gap-2 justify-center">
                  {message.includes('successfully') ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  )}
                  <span className="font-medium">{message}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Election Details Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Election Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                  value={electionName}
                  onChange={(e) => setElectionName(e.target.value)}
                  placeholder="Enter a unique name (min 8 chars)"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all h-32 resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the purpose of this election..."
                  required
                  minLength={20}
                ></textarea>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* File Uploads */}
              <div className="space-y-4">
                <div className="bg-slate-900/30 p-4 rounded-xl border border-white/5">
                  <label className="block text-sm font-medium text-emerald-400 mb-2">Voter List (.xlsx)</label>
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleVoterFileChange}
                    className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 transition-all cursor-pointer"
                    required
                  />
                </div>
                <div className="bg-slate-900/30 p-4 rounded-xl border border-white/5">
                  <label className="block text-sm font-medium text-cyan-400 mb-2">Candidate List (.xlsx)</label>
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleCandidateFileChange}
                    className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 transition-all cursor-pointer"
                    required
                  />
                </div>
              </div>

              {/* Timing */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full mt-8 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300"
            >
              {admin?.role === 'Head Admin' ? 'Create Election' : 'Submit for Approval'}
            </motion.button>

          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default CreateElection;
