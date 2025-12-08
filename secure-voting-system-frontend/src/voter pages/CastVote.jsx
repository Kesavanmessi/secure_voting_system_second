import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

function CastVote() {
    const { voter, logoutVoter } = useContext(AuthContext); // Access voter details
    const [candidates, setCandidates] = useState([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [selectedCandidateId, setSelectedCandidateId] = useState(null);
    const [isLocked, setIsLocked] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!voter) {
            navigate('/voter-login');
            return;
        }

        // Check if election is ongoing
        const checkElectionStatus = () => {
            const currentTime = new Date();
            const startTime = new Date(voter.electionDetails.startTime);
            const endTime = new Date(voter.electionDetails.endTime);
            if (currentTime < startTime || currentTime > endTime) {
                alert("Election is not currently active.");
                navigate('/voter-dashboard');
            }
        };
        checkElectionStatus();

        const fetchCandidates = async () => {
            try {
                const response = await axios.post(
                    'https://secure-voting-system-second.onrender.com/api/elections/electionCandidates-details',
                    { electionId: voter.electionDetails.electionId }
                );

                if (response.data.success) {
                    setCandidates(response.data.candidates);
                } else {
                    setMessage('Failed to fetch candidates details.');
                    setMessageType('error');
                }
            } catch (error) {
                console.error('Error fetching candidates details:', error);
                setMessage('Error fetching candidates details.');
                setMessageType('error');
            }
        };

        fetchCandidates();
    }, [voter, navigate]);

    const handleVoteSubmit = async () => {
        if (!selectedCandidateId) {
            setMessage('Please select a candidate to vote for.');
            setMessageType('error');
            return;
        }

        const voterName = prompt('Enter your name to confirm your vote:');
        if (!voterName) {
            setMessage('Vote confirmation cancelled.');
            setMessageType('error');
            return;
        }
        if (voter.voterName !== voterName) {
            setMessage('You entered the wrong name. Please enter the correct name shown in home.');
            setMessageType('error');
            return;
        }

        try {
            const response = await axios.post('https://secure-voting-system-second.onrender.com/api/elections/cast-vote', {
                electionId: voter.electionDetails.electionId,
                candidateId: selectedCandidateId,
                voterId: voter.voterId,
            });

            if (response.data.success) {
                setIsLocked(true); // Lock the component
                setMessage(
                    `Your vote for ${candidates.find((c) => c.candidateId === selectedCandidateId)?.name} has been cast successfully.`
                );
                setMessageType('success');

                // Update local context or force re-login? 
                // User requirement: "component should be locked...". 
                // We show a locked screen.
            } else {
                setMessage(response.data.message || 'Failed to cast vote.');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Error casting vote:', error);
            setMessage('Error casting vote. Please try again.');
            setMessageType('error');
        }
    };

    if (isLocked) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-8">
                <div className="bg-slate-800 p-10 rounded-2xl border border-green-500/30 text-center shadow-2xl max-w-lg">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold mb-4 text-green-400">Vote Cast Successfully!</h2>
                    <p className="text-slate-300 mb-8">
                        Thank you for voting. Your vote has been recorded securely.
                        You can no longer access the voting page for this election.
                    </p>
                    <button
                        onClick={() => navigate('/voter-dashboard')}
                        className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-xl transition-all"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Cast Your Vote</h1>

                <div className="bg-slate-800/80 p-8 rounded-2xl border border-white/10 shadow-2xl">
                    <h3 className="text-2xl font-bold mb-6 text-center text-white">Select a Candidate</h3>
                    <div className="space-y-4 max-w-2xl mx-auto">
                        {candidates.map((candidate) => (
                            <label key={candidate.candidateId} className={`flex items-center p-4 rounded-xl cursor-pointer transition-all ${selectedCandidateId === candidate.candidateId ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-700/30 border-transparent hover:bg-slate-700/50'} border-2`}>
                                <input
                                    type="radio"
                                    name="candidate"
                                    value={candidate.candidateId}
                                    className="w-6 h-6 text-emerald-500 focus:ring-emerald-500 border-gray-500"
                                    onChange={() => setSelectedCandidateId(candidate.candidateId)}
                                />
                                <div className="ml-4 flex flex-col">
                                    <span className="text-xl font-medium text-white">{candidate.candidateName || candidate.name}</span>
                                    {candidate.party && <span className="text-sm text-slate-400">{candidate.party}</span>}
                                </div>
                            </label>
                        ))}
                    </div>
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={handleVoteSubmit}
                            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3 px-12 rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-105"
                        >
                            Confirm Vote
                        </button>
                    </div>
                </div>
                {message && (
                    <div className={`mt-6 p-4 rounded-xl text-center font-medium ${messageType === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CastVote;
