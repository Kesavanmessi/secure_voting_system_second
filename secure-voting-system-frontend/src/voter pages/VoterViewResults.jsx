import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';

const getGoogleDriveDirectLink = (url) => {
    if (!url) return null;
    try {
        const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|docs\.google\.com\/file\/d\/|drive\.google\.com\/u\/\d+\/file\/d\/)([-a-zA-Z0-9_]+)/;
        const match = url.match(driveRegex);
        if (match && match[1]) return `https://drive.google.com/uc?export=view&id=${match[1]}`;

        if (url.includes('id=')) {
            try {
                const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
                const id = urlObj.searchParams.get('id');
                if (id) return `https://drive.google.com/uc?export=view&id=${id}`;
            } catch (err) { }
        }
        return url;
    } catch (e) {
        return url;
    }
};

const CandidateAvatar = ({ src, alt, name, className, placeholderClassName, textClassName }) => {
    const [error, setError] = useState(false);

    if (!src || error) {
        return (
            <div className={`${className} ${placeholderClassName || 'bg-slate-600'} flex items-center justify-center border border-slate-500`}>
                <span className={`${textClassName || 'text-xs'} font-bold text-slate-300`}>
                    {(name || '?').charAt(0).toUpperCase()}
                </span>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={`${className} object-cover`}
            onError={() => setError(true)}
            referrerPolicy="no-referrer"
        />
    );
};

function VoterViewResults() {
    const { voter } = useAuth();
    const [candidates, setCandidates] = useState([]);
    const [winner, setWinner] = useState(null);
    const [isTie, setIsTie] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!voter) {
            navigate('/voter-login');
            return;
        }

        // Check if electionDetails exists
        if (!voter.electionDetails || !voter.electionDetails.electionId) {
            console.error("Missing election details for voter");
            setLoading(false);
            return;
        }

        const fetchResults = async () => {
            try {
                const response = await axios.get(`https://secure-voting-system-second.onrender.com/api/elections/results/${voter.electionDetails.electionId}`);
                if (response.data.success) {
                    setCandidates(response.data.candidates);
                    setWinner(response.data.winner);
                    setIsTie(response.data.isTie);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching results:', error);
                setLoading(false);
            }
        };

        fetchResults();
    }, [voter, navigate]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-900">
                <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!voter || !voter.electionDetails) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-400">
                <p>Error: Voter information missing.</p>
                <button onClick={() => navigate('/voter-login')} className="mt-4 text-blue-400 hover:underline">Return to Login</button>
            </div>
        );
    }

    const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 p-8 flex justify-center items-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-3xl bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-2xl"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-500 mb-2">
                        Election Results
                    </h1>
                    <h2 className="text-xl text-slate-400">{voter.electionDetails.electionName}</h2>
                </div>

                {winner && (
                    <div className="mb-6 p-6 rounded-xl bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 flex flex-col items-center text-center">
                        <p className="text-sm text-yellow-500 font-bold uppercase tracking-wider mb-3">
                            {isTie ? 'Winner (Random Tie-Break)' : 'Winner'}
                        </p>

                        <CandidateAvatar
                            src={getGoogleDriveDirectLink(winner.profile)}
                            alt={winner.name}
                            name={winner.name}
                            className="w-24 h-24 rounded-full border-4 border-yellow-500/50 mb-3"
                            placeholderClassName="bg-yellow-500 border-yellow-500/50"
                            textClassName="text-3xl text-slate-900"
                        />

                        <p className="text-2xl font-bold text-white mb-1">{winner.name || 'Unknown'}</p>
                        <p className="text-slate-400 mb-2">{winner.party}</p>
                        <p className="text-lg text-yellow-400 font-bold">{winner.votes} Votes</p>

                        {isTie && <div className="mt-2 text-xs text-red-400 font-bold border border-red-500/30 px-3 py-1 rounded-full">⚠ Randomly Selected</div>}
                    </div>
                )}

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-700 pb-2 mb-4">Detailed Results</h3>
                    {candidates.length > 0 ? (
                        candidates.sort((a, b) => b.votes - a.votes).map((candidate, idx) => {
                            const isWinner = winner && winner.candidateId === candidate.candidateId;
                            const percent = totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0;

                            return (
                                <div key={idx} className="relative p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-colors">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-3">
                                            <CandidateAvatar
                                                src={getGoogleDriveDirectLink(candidate.profile || candidate.image)}
                                                alt={candidate.name}
                                                name={candidate.name}
                                                className="w-8 h-8 rounded-full border border-slate-600"
                                            />
                                            <div>
                                                <span className={`font-medium block ${isWinner ? 'text-yellow-400' : 'text-slate-300'}`}>
                                                    {candidate.name}
                                                    <span className="text-slate-500 text-xs ml-2">({candidate.party})</span>
                                                    {isWinner && <span className="ml-2 text-[10px] bg-yellow-500 text-slate-900 px-1.5 py-0.5 rounded font-bold">WIN</span>}
                                                </span>
                                            </div>
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
                        })
                    ) : (
                        <p className="text-slate-500 italic text-center">No results available.</p>
                    )}
                </div>

                <div className="mt-8 text-center border-t border-slate-700 pt-6">
                    <button
                        onClick={() => navigate('/voter-dashboard')}
                        className="text-slate-400 hover:text-white transition-colors text-sm hover:underline"
                    >
                        &larr; Back to Dashboard
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default VoterViewResults;
