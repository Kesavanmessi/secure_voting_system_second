import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';

function Home() {
  const { voter } = useContext(AuthContext);
  const navigate = useNavigate();
  const [ticketData, setTicketData] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [status, setStatus] = useState("loading"); // loading, upcoming, ongoing, ended
  const [isResultPublished, setIsResultPublished] = useState(false);

  useEffect(() => {
    if (voter?.electionDetails?.electionId) {
      fetchElectionStatus();
    }
  }, [voter]);

  const fetchElectionStatus = async () => {
    try {
      const response = await axios.get(`https://secure-voting-system-second.onrender.com/api/elections/one/${voter.electionDetails.electionId}?voterId=${voter.voterId}`);
      if (response.data) {
        setTicketData(response.data);
        setIsResultPublished(response.data.isResultPublished);
      }
    } catch (error) {
      console.error("Error fetching election status:", error);
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      // Prioritize live ticketData if available for accurate endTime
      const source = ticketData || voter?.electionDetails;
      if (!source) return;

      const now = new Date();
      const start = new Date(source.startTime);
      const end = new Date(source.endTime);

      if (now < start) {
        setStatus("upcoming");
        setTimeLeft(calculateTimeLeft(start - now));
      } else if (now >= start && now <= end) {
        setStatus("ongoing");
        setTimeLeft(calculateTimeLeft(end - now));
      } else {
        setStatus("ended");
        setTimeLeft("Election Ended");
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [voter, ticketData]);

  const calculateTimeLeft = (ms) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'upcoming': return 'text-yellow-400';
      case 'ongoing': return 'text-emerald-400';
      case 'ended': return 'text-red-400';
      default: return 'text-slate-400';
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{voter?.electionDetails?.electionName}</h1>
            <p className="text-slate-400">{voter?.electionDetails?.description}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-slate-900/50 border border-white/10 px-6 py-4 rounded-xl text-center min-w-[200px]">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Time Remaining</p>
              <p className={`text-2xl font-mono font-bold ${getStatusColor()}`}>
                {timeLeft}
              </p>
            </div>

            <div className="bg-slate-900/50 border border-white/10 px-6 py-4 rounded-xl text-center min-w-[200px]">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Live Turnout</p>
              <p className="text-2xl font-mono font-bold text-emerald-400">
                {ticketData?.stats?.percentage || 0}%
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {ticketData?.stats?.voted || 0} / {ticketData?.stats?.total || 0} Voted
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Voter ID Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0c0 .883-.393 1.627-1.08 2.122A4.01 4.01 0 009 8.618" /></svg>
              Voter Credentials
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Name</span>
                <span className="text-white font-medium">{voter?.voterName}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Voter ID</span>
                <span className="font-mono text-emerald-400">{voter?.voterId}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Age</span>
                <span className="text-white">{voter?.age}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Address</span>
                <span className="text-white text-right max-w-[200px] truncate">{voter?.address}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col justify-center items-center text-center relative overflow-hidden"
        >
          {/* Gradient Background for Actions */}
          <div className={`absolute inset-0 opacity-10 ${status === 'ongoing' ? 'bg-gradient-to-br from-emerald-500 to-cyan-500' : 'bg-gradient-to-br from-slate-500 to-slate-700'}`}></div>

          <div className="relative z-10 w-full">
            <h3 className="text-xl font-bold text-white mb-2">Actions</h3>

            {status === 'upcoming' && (
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-200">
                Voting has not started yet. Please wait.
              </div>
            )}

            {status === 'ongoing' && (
              <div className="space-y-4">
                {ticketData?.hasVoted ? (
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse border border-red-500/30">
                      <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-red-400 font-bold text-lg">Vote Locked</p>
                      <p className="text-slate-400 text-sm mt-1">You have already cast your vote.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-300 mb-6">The polls are open! You can cast your secure vote now.</p>
                    <button
                      onClick={() => navigate('/cast-vote')}
                      className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Enter Voting Booth
                    </button>
                  </>
                )}
              </div>
            )}


            {status === 'ended' && (
              <div className="space-y-4">
                <p className="text-slate-300">The election has concluded.</p>
                <button
                  onClick={() => navigate('/voter-results')}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  View Results
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* How to Vote Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/30 backdrop-blur-xl border border-white/5 rounded-2xl p-8 max-w-5xl mx-auto"
      >
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          How to Vote
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 relative group hover:border-cyan-500/30 transition-all cursor-default">
            <div className="absolute top-4 right-4 text-4xl font-black text-slate-800 group-hover:text-cyan-500/10 transition-colors">1</div>
            <h4 className="text-emerald-400 font-bold mb-2">Check Status</h4>
            <p className="text-sm text-slate-400">Ensure the election status is "Ongoing" and the countdown is active.</p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 relative group hover:border-cyan-500/30 transition-all cursor-default">
            <div className="absolute top-4 right-4 text-4xl font-black text-slate-800 group-hover:text-cyan-500/10 transition-colors">2</div>
            <h4 className="text-emerald-400 font-bold mb-2">Enter Booth</h4>
            <p className="text-sm text-slate-400">Click "Enter Voting Booth" or "Proceed to Cast Vote" from details.</p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 relative group hover:border-cyan-500/30 transition-all cursor-default">
            <div className="absolute top-4 right-4 text-4xl font-black text-slate-800 group-hover:text-cyan-500/10 transition-colors">3</div>
            <h4 className="text-emerald-400 font-bold mb-2">Choose Candidate</h4>
            <p className="text-sm text-slate-400">Select your preferred candidate from the list securely.</p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 relative group hover:border-cyan-500/30 transition-all cursor-default">
            <div className="absolute top-4 right-4 text-4xl font-black text-slate-800 group-hover:text-cyan-500/10 transition-colors">4</div>
            <h4 className="text-emerald-400 font-bold mb-2">Confirm Vote</h4>
            <p className="text-sm text-slate-400">Verify your identity and confirm your vote. Once cast, it cannot be changed.</p>
          </div>
        </div>
      </motion.div>

    </div>
  );
}

export default Home;
