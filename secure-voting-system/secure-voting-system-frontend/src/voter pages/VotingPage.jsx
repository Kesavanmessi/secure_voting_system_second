import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

function VotingPage() {
  const { voter, logoutVoter } = useContext(AuthContext);
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('loading'); // loading, active, success, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!voter?.electionDetails?.electionId) {
      navigate('/voter-dashboard');
      return;
    }
    fetchCandidates();
  }, [voter, navigate]);

  const fetchCandidates = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/elections/electionCandidates-details', {
        electionId: voter.electionDetails.electionId
      });

      if (response.data.success) {
        setCandidates(response.data.candidates);
        setStatus('active');
      } else {
        setErrorMessage("Failed to load candidates.");
        setStatus('error');
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
      setErrorMessage("Error connecting to server.");
      setStatus('error');
    }
  };

  const handleVoteSubmit = async () => {
    if (!selectedCandidate) return;
    setIsSubmitting(true);

    try {
      const response = await axios.post('http://localhost:5000/api/elections/cast-vote', {
        electionId: voter.electionDetails.electionId,
        voterId: voter.voterId,
        candidateId: selectedCandidate.candidateId
      });

      if (response.data.success) {
        setStatus('success');
        setTimeout(() => {
          logoutVoter(); // Logout for security/session end
          navigate('/voter-login');
        }, 5000); // 5 seconds delay to show success message
      } else {
        setErrorMessage(response.data.message || "Vote submission failed.");
        setShowConfirm(false);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error casting vote:", error);
      setErrorMessage(error.response?.data?.message || "Error submitting vote. Please try again.");
      setShowConfirm(false);
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Success View
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-8 text-center"
        >
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Vote Submitted!</h2>
          <p className="text-slate-400 mb-6">Your vote has been securely recorded and encrypted.</p>
          <p className="text-sm text-slate-500">Redirecting to login in 5 seconds...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-6 md:p-12 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Official Ballot</h1>
          <p className="text-slate-400">Select one candidate to cast your vote. This action cannot be undone.</p>
          {errorMessage && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl inline-block">
              {errorMessage}
            </div>
          )}
        </header>

        {/* Candidates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {candidates.map((candidate) => (
            <motion.div
              key={candidate.candidateId}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCandidate(candidate)}
              className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 relative overflow-hidden group ${selectedCandidate?.candidateId === candidate.candidateId
                  ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-slate-800/50 border-white/5 hover:border-white/20'
                }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-lg font-bold text-white uppercase border border-white/10">
                  {candidate.name?.charAt(0)}
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedCandidate?.candidateId === candidate.candidateId ? 'border-emerald-500 bg-emerald-500' : 'border-slate-500'}`}>
                  {selectedCandidate?.candidateId === candidate.candidateId && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{candidate.name}</h3>
              <p className="text-sm text-slate-400 mb-2">{candidate.party || 'Independent'}</p>
              <p className="text-xs text-slate-500 font-mono">ID: {candidate.candidateId}</p>
            </motion.div>
          ))}
        </div>

        {/* Action Bar */}
        <div className="fixed bottom-0 left-0 w-full bg-slate-900/90 backdrop-blur-xl border-t border-white/10 p-6 z-20">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-400">Selected Candidate</p>
              <p className="text-white font-bold text-lg">{selectedCandidate ? selectedCandidate.name : 'None'}</p>
            </div>
            <motion.button
              disabled={!selectedCandidate}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowConfirm(true)}
              className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all ${selectedCandidate
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-emerald-500/20 cursor-pointer'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
            >
              Cast Vote
            </motion.button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowConfirm(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Confirm Your Vote</h2>

              <div className="bg-slate-800/50 rounded-xl p-6 mb-8 border border-white/5">
                <p className="text-slate-400 text-sm mb-2">You are about to vote for:</p>
                <h3 className="text-3xl font-bold text-white mb-1">{selectedCandidate?.name}</h3>
                <p className="text-emerald-400 text-lg">{selectedCandidate?.party}</p>
              </div>

              <p className="text-slate-400 text-sm mb-8 text-center bg-red-500/5 border border-red-500/10 p-3 rounded-lg">
                ⚠️ This action cannot be undone. Once submitted, your vote is final and anonymous.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors border border-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVoteSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    'Confirm Vote'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default VotingPage;
