import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';

function VoterResultPage() {
  const { voter, logoutVoter } = useContext(AuthContext);
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!voter?.electionDetails?.electionId) {
      navigate('/voter-dashboard');
      return;
    }
    fetchResults();
  }, [voter, navigate]);

  const fetchResults = async () => {
    try {
      // First check if results are published
      const statusRes = await axios.post('https://secure-voting-system-second.onrender.com/api/elections/is-result-published', {
        electionId: voter.electionDetails.electionId
      });

      if (!statusRes.data.isPublished) {
        setError("Results have not been published yet.");
        setLoading(false);
        return;
      }

      // Fetch actual results
      const response = await axios.get(`https://secure-voting-system-second.onrender.com/api/elections/results/${voter.electionDetails.electionId}`);

      if (response.data.success) {
        const candidates = response.data.candidates;
        setResults(candidates);

        // Determine winner
        if (candidates.length > 0) {
          const winnerCandidate = candidates.reduce((prev, current) =>
            prev.votes > current.votes ? prev : current
          );
          setWinner(winnerCandidate);
        }
      } else {
        setError("Failed to load results.");
      }
    } catch (err) {
      console.error("Error fetching results:", err);
      setError("Error loading results. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutVoter();
    navigate('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-8">
      <div className="max-w-4xl mx-auto">

        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {voter?.electionDetails?.electionName}
            </h1>
            <p className="text-slate-400">Official Election Results</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors border border-white/5"
          >
            Log Out
          </button>
        </header>

        {error ? (
          <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-white/5">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Notice</h2>
            <p className="text-slate-400">{error}</p>
            <button
              onClick={() => navigate('/voter-dashboard')}
              className="mt-6 text-indigo-400 hover:text-indigo-300 font-medium"
            >
              &larr; Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-8">

            {/* Winner Card */}
            {winner && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-8 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 p-1 shadow-xl shadow-orange-500/20">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                      <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-orange-500">
                        {winner.name.charAt(0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                      <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      <span className="text-yellow-500 font-bold uppercase tracking-widest text-xs">Winner Evaluated</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-1">{winner.name}</h2>
                    <p className="text-slate-400 text-lg">{winner.party}</p>
                  </div>

                  <div className="bg-slate-900/50 backdrop-blur border border-white/10 rounded-xl px-6 py-4">
                    <p className="text-slate-400 text-xs uppercase mb-1">Total Votes</p>
                    <p className="text-3xl font-bold text-white">{winner.votes}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Detailed Results */}
            <div className="bg-slate-800/50 backdrop-blur border border-white/5 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Vote Breakdown</h3>
              <div className="space-y-6">
                {results && results.map((candidate, idx) => {
                  const maxVotes = Math.max(...results.map(c => c.votes));
                  const percent = maxVotes > 0 ? (candidate.votes / maxVotes) * 100 : 0;
                  const isWinner = winner && winner.candidateId === candidate.candidateId;

                  return (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      key={candidate.candidateId}
                    >
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <span className={`text-lg font-bold ${isWinner ? 'text-yellow-400' : 'text-white'}`}>{candidate.name}</span>
                          <span className="text-slate-500 text-sm ml-2">{candidate.party}</span>
                        </div>
                        <span className="text-slate-300 font-mono">{candidate.votes} votes</span>
                      </div>
                      <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${isWinner ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-slate-500'}`}
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default VoterResultPage;
