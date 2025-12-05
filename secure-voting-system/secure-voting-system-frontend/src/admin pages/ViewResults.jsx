import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

function ViewResults() {
  const [elections, setElections] = useState({
    published: [],
    notPublished: [],
  });
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
      const response = await axios.get('http://localhost:5000/api/elections/finished');
      const publishedElections = response.data.filter(e => e.isResultPublished);
      // Sort not published by end time as well just in case backend didn't (though backend should)
      const notPublishedElections = response.data.filter(e => !e.isResultPublished);

      setElections({ published: publishedElections, notPublished: notPublishedElections });
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
      const response = await axios.get(`http://localhost:5000/api/elections/results/${election._id}`);
      const resultData = response.data;

      if (resultData.success) {
        let winnerCandidate = null;
        if (resultData.candidates && resultData.candidates.length > 0) {
          winnerCandidate = resultData.candidates.reduce((prev, current) =>
            prev.votes > current.votes ? prev : current
          );
        }

        setSelectedElection({
          ...election,
          candidates: resultData.candidates,
        });
        setWinner(winnerCandidate);
        // showMessage(`Displaying results for ${election.electionName}`, 'success');
      } else {
        showMessage('Failed to fetch election results.', 'error');
      }
    } catch (error) {
      console.error('Error fetching election results:', error);
      showMessage('Failed to fetch election results.', 'error');
    }
  };

  const publishResults = async (electionId) => {
    try {
      await axios.post(`http://localhost:5000/api/elections/publish/${electionId}`);
      setElections((prev) => {
        const updatedNotPublished = prev.notPublished.filter((e) => e._id !== electionId);
        const updatedPublished = [
          ...prev.published,
          ...prev.notPublished.filter((e) => e._id === electionId),
        ];
        return {
          published: updatedPublished.map((e) =>
            e._id === electionId ? { ...e, isResultPublished: true } : e
          ),
          notPublished: updatedNotPublished,
        };
      });
      showMessage('Results have been published!', 'success');
    } catch (error) {
      console.error('Error publishing results:', error);
      showMessage('Failed to publish results.', 'error');
    }
  };

  const moveToFinishedElections = async (electionId) => {
    try {
      await axios.post(`http://localhost:5000/api/elections/move-to-finished/${electionId}`);
      setElections((prev) => ({
        ...prev,
        published: prev.published.filter((e) => e._id !== electionId),
      }));
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
            <p className="text-slate-400 mt-2">View and publish results for completed elections.</p>
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

        {/* Not Published Section */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-yellow-500 pl-4">Pending Publication</h2>
          {elections.notPublished.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700 text-center text-slate-500 italic">
              No completed elections pending publication.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {elections.notPublished.map((election) => (
                <ResultCard
                  key={election._id}
                  election={election}
                  selectedElection={selectedElection}
                  onToggle={toggleResults}
                  onPublish={publishResults}
                  onMoveToFinished={moveToFinishedElections}
                  isPublished={false}
                  winner={winner}
                />
              ))}
            </div>
          )}
        </section>

        {/* Published Section */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-green-500 pl-4">Published Results</h2>
          {elections.published.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700 text-center text-slate-500 italic">
              No published results yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {elections.published.map((election) => (
                <ResultCard
                  key={election._id}
                  election={election}
                  selectedElection={selectedElection}
                  onToggle={toggleResults}
                  onPublish={publishResults}
                  onMoveToFinished={moveToFinishedElections}
                  isPublished={true}
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

const ResultCard = ({ election, selectedElection, onToggle, onPublish, onMoveToFinished, isPublished, winner }) => {
  const isSelected = selectedElection && selectedElection._id === election._id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl border backdrop-blur-xl p-6 transition-all ${isPublished
          ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700 shadow-lg shadow-green-900/10'
          : 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700 shadow-lg shadow-yellow-900/10'
        } ${isSelected ? 'ring-2 ring-cyan-500/50' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white leading-tight">{election.electionName}</h3>
          <p className="text-xs text-slate-400 mt-1">Ended: {new Date(election.endTime).toLocaleString()}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${isPublished ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
          }`}>
          {isPublished ? 'Live' : 'Hidden'}
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
                <p className="text-xs text-yellow-500 font-bold uppercase tracking-wider mb-1">Winner</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-slate-900 font-bold text-lg">
                    {winner.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{winner.name}</p>
                    <p className="text-sm text-yellow-400">{winner.votes} Votes</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {selectedElection.candidates.map((candidate, idx) => {
                const isWinner = winner && winner.candidateId === candidate.candidateId;
                const maxVotes = Math.max(...selectedElection.candidates.map(c => c.votes));
                const percent = maxVotes > 0 ? (candidate.votes / maxVotes) * 100 : 0;

                return (
                  <div key={idx} className="relative">
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`font-medium ${isWinner ? 'text-yellow-400' : 'text-slate-300'}`}>
                        {candidate.name} <span className="text-slate-500 text-xs ml-1">({candidate.party})</span>
                      </span>
                      <span className="text-slate-200 font-bold">{candidate.votes}</span>
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
              {!isPublished && (
                <button
                  onClick={() => onPublish(election._id)}
                  className="w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold text-sm transition-all shadow-lg shadow-green-900/20"
                >
                  Publish Results to Voters
                </button>
              )}
              {isPublished && (
                <button
                  onClick={() => onMoveToFinished(election._id)}
                  className="w-full py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 hover:text-white text-slate-300 font-semibold text-sm transition-all border border-slate-600 hover:border-slate-500"
                >
                  Archive Election
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ViewResults;
