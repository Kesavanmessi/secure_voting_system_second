import { useContext, useEffect, useState } from 'react';

// Helper to convert Google Drive view links to direct image links
const getGoogleDriveDirectLink = (url) => {
  if (!url) return null;
  try {
    // 1. Check for standard Google Drive URL patterns with Regex
    // Supports: /file/d/ID, /open?id=ID, /uc?id=ID
    const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|docs\.google\.com\/file\/d\/|drive\.google\.com\/u\/\d+\/file\/d\/)([-a-zA-Z0-9_]+)/;
    const match = url.match(driveRegex);

    if (match && match[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }

    // 2. Fallback: Check Query Params directly
    if (url.includes('id=')) {
      try {
        // Handle cases where URL might be partial or malformed
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
        const id = urlObj.searchParams.get('id');
        if (id) return `https://drive.google.com/uc?export=view&id=${id}`;
      } catch (err) {
        // ignore
      }
    }

    return url;
  } catch (e) {
    return url;
  }
};
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const CandidateAvatar = ({ src, alt, name }) => {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center border-4 border-slate-700 shadow-lg">
        <span className="text-4xl font-bold text-slate-400">
          {(name || '?').charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-32 h-32 rounded-full object-cover border-4 border-slate-700 shadow-lg"
      onError={() => setError(true)}
      referrerPolicy="no-referrer"
    />
  );
};

function ElectionDetails() {
  const { voter } = useContext(AuthContext); // Access voter details
  const [candidates, setCandidates] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [showVotingArea, setShowVotingArea] = useState(false);
  const [isResultPublished, setIsResultPublished] = useState(false);
  const [showVotingInstructions, setShowVotingInstructions] = useState(false);
  const navigate = useNavigate();

  const { electionDetails } = voter;

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await axios.post(
          'http://localhost:5000/api/elections/electionCandidates-details',
          { electionId: electionDetails.electionId }
        );

        if (response.data.success) {
          setCandidates(response.data.candidates);
        } else {
          setMessage('Failed to fetch candidates details.');
          setMessageType('error');
        }
      } catch (error) {
        console.error('Error fetching candidates details:', error);
        setMessage('Error fetching candidates details. Please try again.');
        setMessageType('error');
      }
    };

    const checkResultPublished = async () => {
      try {
        const response = await axios.post(
          'http://localhost:5000/api/elections/is-result-published',
          { electionId: electionDetails.electionId }
        );

        if (response.data.success) {
          setIsResultPublished(response.data.isPublished);
        }
      } catch (error) {
        console.error('Error checking result status:', error);
      }
    };

    fetchCandidates();
    checkResultPublished();
  }, [electionDetails.electionId]);

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
      const response = await axios.post('http://localhost:5000/api/elections/cast-vote', {
        electionId: voter.electionDetails.electionId,
        candidateId: selectedCandidateId,
        voterId: voter.voterId,
      });

      if (response.data.success) {
        setMessage(
          `Your vote for ${candidates.find((c) => c.candidateId === selectedCandidateId)?.name} has been cast successfully.`
        );
        setMessageType('success');
        setTimeout(() => navigate('/voter-login'), 4000); // Redirect after 4 seconds
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

  const currentTime = new Date();
  const adjustedStartTime = new Date(new Date(electionDetails.startTime).getTime() + 1 * 60 * 1000); // +1 minute
  const endTime = new Date(electionDetails.endTime);

  const isOngoing = currentTime >= adjustedStartTime && currentTime <= endTime;
  const isFinished = currentTime > endTime;

  if (candidates.length === 0) {
    return <p className="text-white text-center">Loading candidates...</p>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10 flex flex-col items-center">
      <h1 className="text-4xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500 font-bold">{electionDetails.electionName}</h1>
      <p className="text-slate-400 text-lg mb-8 max-w-3xl text-center">{electionDetails.description}</p>

      <div className="w-full max-w-6xl">
        <h2 className="text-3xl font-bold mb-8 text-center text-white border-b border-slate-700 pb-4">Participating Candidates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {candidates.map((candidate) => (
            <div key={candidate.candidateId} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-all shadow-lg">
              <div className="mb-4 flex justify-center">
                <CandidateAvatar
                  src={getGoogleDriveDirectLink(candidate.profile || candidate.image)}
                  alt={candidate.name}
                  name={candidate.candidateName || candidate.name}
                />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 text-center">{candidate.candidateName || candidate.name}</h3>
              {candidate.party && <p className="text-cyan-400 font-medium mb-4 text-center">{candidate.party}</p>}

              <div className="space-y-2 text-sm text-slate-300">
                {Object.entries(candidate).map(([key, value]) => {
                  if (['candidateId', 'candidateName', 'name', 'party', '_id', 'voteCount', '__v', 'profile'].includes(key)) return null;
                  return (
                    <div key={key} className="flex justify-between border-b border-slate-700 pb-1">
                      <span className="capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="font-medium text-slate-200">{value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          {!isOngoing && !isFinished && (
            <div className="px-6 py-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg">
              Election is not currently active.
            </div>
          )}
          {isOngoing && (
            <div className="px-6 py-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg">
              Election is currently active. Go to Dashboard to Vote.
            </div>
          )}
          {isFinished && (
            <div className="px-6 py-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
              Election has ended.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ElectionDetails;
