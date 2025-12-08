import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to convert Google Drive view links to direct image links
const getGoogleDriveDirectLink = (url) => {
  if (!url) return null;
  try {
    if (url.includes('drive.google.com')) {
      let id = '';
      const parts = url.split('/');
      const dIndex = parts.indexOf('d');
      if (dIndex !== -1 && dIndex + 1 < parts.length) {
        id = parts[dIndex + 1];
      } else {
        const urlObj = new URL(url);
        id = urlObj.searchParams.get('id');
      }
      if (id) return `https://drive.google.com/uc?export=view&id=${id}`;
    }
    return url;
  } catch (e) {
    return url;
  }
};

function ViewResults() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    fetchFinishedElections();
  }, []);

  const fetchFinishedElections = async () => {
    try {
      const token = localStorage.getItem("secureVoting_adminToken");
      const response = await axios.get('https://secure-voting-system-second.onrender.com/api/elections/finished', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setElections(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching elections:', error);
      showMessage('Failed to load elections.', 'error');
      setLoading(false);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(null), 3000);
  };

  const toggleResults = async (election) => {
    if (selectedElection && selectedElection._id === election._id) {
      setSelectedElection(null);
      setWinner(null);
      return;
    }

    try {
      const response = await axios.get(`https://secure-voting-system-second.onrender.com/api/elections/results/${election._id}`);
      const resultData = response.data;

      if (resultData.success) {
        setSelectedElection({
          ...election,
          candidates: resultData.candidates,
          isTie: resultData.isTie
        });
        setWinner(resultData.winner);
      } else {
        showMessage('Failed to fetch election results.', 'error');
      }
    } catch (error) {
      console.error('Error fetching election results:', error);
      showMessage('Failed to fetch election results.', 'error');
    }
  };

  const moveToFinishedElections = async (electionId) => {
    try {
      await axios.post(`https://secure-voting-system-second.onrender.com/api/elections/move-to-finished/${electionId}`);
      setElections((prev) => prev.filter((e) => e._id !== electionId));
      showMessage('Election moved to finished (archived).', 'success');
      if (selectedElection && selectedElection._id === electionId) {
        setSelectedElection(null);
      }
    } catch (error) {
      console.error('Error moving election to finished:', error);
      showMessage('Failed to move election to finished.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-900">
        <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-500">
              Election Results
            </h1>
            <p className="text-slate-400 mt-2">View results for completed elections.</p>
          </div>
        </header>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl text-center font-semibold backdrop-blur-md shadow-lg border ${messageType === 'success'
              ? 'bg-green-500/20 text-green-300 border-green-500/50'
              : 'bg-red-500/20 text-red-300 border-red-500/50'
              }`}
          >
            {message}
          </motion.div>
        )}

        <section>
          {elections.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700 text-center text-slate-500 italic">
              No completed elections found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {elections.map((election) => (
                <ResultCard
                  key={election._id}
                  election={election}
                  selectedElection={selectedElection}
                  onToggle={toggleResults}
                  onMoveToFinished={moveToFinishedElections}
                  winner={winner}
                />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

const ResultCard = ({ election, selectedElection, onToggle, onMoveToFinished, winner }) => {
  const isSelected = selectedElection && selectedElection._id === election._id;
  const isTie = isSelected ? selectedElection.isTie : false;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`group relative rounded-2xl border backdrop-blur-xl p-6 transition-all bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700 shadow-lg shadow-green-900/10 ${isSelected ? 'ring-2 ring-cyan-500/50' : ''}`}
    >
      {/* Hover Stats Section - Compact & Top Right */}
      <div className="absolute top-14 right-4 w-40 p-2 bg-slate-900/95 border border-slate-700 rounded-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 text-center transform translate-y-1 group-hover:translate-y-0 pointer-events-none shadow-xl">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Turnout</p>
        <div className="flex justify-center items-end gap-1 mb-1">
          <span className="text-lg font-bold text-white leading-none">{election.stats?.voted || 0}</span>
          <span className="text-[10px] text-slate-500">/ {election.stats?.total || 0}</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden mb-1">
          <div
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${election.stats?.percentage || 0}%` }}
          ></div>
        </div>
        <p className="text-[10px] text-emerald-400 font-bold">{election.stats?.percentage || 0}%</p>
      </div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white leading-tight">{election.electionName}</h3>
          <p className="text-xs text-slate-400 mt-1">Ended: {new Date(election.endTime).toLocaleString()}</p>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-green-500/20 text-green-400 border border-green-500/30">
          Result Available
        </div>
      </div>

      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => onToggle(election)}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${isSelected
            ? 'bg-slate-700 text-white'
            : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20'
            }`}
        >
          {isSelected ? 'Hide Results' : 'View Results'}
        </button>
      </div>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-slate-700 overflow-hidden"
          >
            {winner && (
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30">
                <p className="text-xs text-yellow-500 font-bold uppercase tracking-wider mb-1">
                  {isTie ? 'Winner (Random Tie-Break)' : 'Winner'}
                </p>
                <div className="flex items-center gap-3">
                  {winner.profile ? (
                    <img
                      src={getGoogleDriveDirectLink(winner.profile)}
                      alt={winner.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-yellow-500/50"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-slate-900 font-bold text-lg">
                      {winner.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-bold text-white">{winner.name || 'Unknown'}</p>
                    <p className="text-sm text-yellow-400">{winner.votes} Votes</p>
                  </div>
                </div>
                {isTie && <div className="mt-2 text-xs text-red-400 font-bold border border-red-500/30 px-2 py-1 rounded w-fit inline-block">⚠ Randomly Selected</div>}
              </div>
            )}

            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {selectedElection.candidates.sort((a, b) => b.votes - a.votes).map((candidate, idx) => {
                const isWinner = winner && winner.candidateId === candidate.candidateId;
                const totalVotes = selectedElection.candidates.reduce((sum, c) => sum + c.votes, 0);
                const percent = totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0;

                return (
                  <div key={idx} className="relative">
                    <div className="flex justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        {candidate.profile && (
                          <img
                            src={getGoogleDriveDirectLink(candidate.profile)}
                            alt={candidate.name}
                            className="w-6 h-6 rounded-full object-cover border border-slate-600"
                          />
                        )}
                        <span className={`font-medium ${isWinner ? 'text-yellow-400' : 'text-slate-300'}`}>
                          {candidate.name} <span className="text-slate-500 text-xs ml-1">({candidate.party})</span>
                          {isWinner && <span className="ml-1 text-[10px] bg-yellow-500 text-slate-900 px-1 rounded font-bold">WIN</span>}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-200 font-bold block">{candidate.votes}</span>
                        <span className="text-[10px] text-slate-500">{percent.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${isWinner ? 'bg-yellow-500' : 'bg-slate-500'}`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 space-y-3 pt-4 border-t border-slate-700/50">
              <button
                onClick={() => onMoveToFinished(election._id)}
                className="w-full py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 hover:text-white text-slate-300 font-semibold text-sm transition-all border border-slate-600 hover:border-slate-500"
              >
                Archive Election
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ViewResults;
