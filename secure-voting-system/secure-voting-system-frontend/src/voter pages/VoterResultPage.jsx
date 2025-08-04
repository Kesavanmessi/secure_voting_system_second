import { useState, useEffect , useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
function VoterResultPage() {
  const { voter } = useContext(AuthContext);// Election ID passed as a route parameter
  const id = voter?.electionDetails?.electionId;
  const navigate = useNavigate();
  const [electionResults, setElectionResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/elections/results/${id}`);
        if (response.data.success) {
          setElectionResults({
            candidates: response.data.candidates,
          });
        } else {
          setError('Results not available for this election.');
        }
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Failed to fetch election results. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-gray-900 text-white p-10 flex flex-col items-center min-h-screen">
        <h1 className="text-4xl text-yellow-300 mb-8">Loading...</h1>
        <p className="text-lg text-gray-400">Please wait while we fetch the results.</p>
      </div>
    );
  }

  if (error || !electionResults ) {
    return (
      <div className="bg-gray-900 text-white p-10 flex flex-col items-center min-h-screen">
        <h1 className="text-4xl text-red-400 mb-8">Results Not Available</h1>
        <p className="text-lg text-gray-400">
          {error || 'The results of this election are not yet published. Please check again later.'}
        </p>
        <button
          onClick={() => navigate('/voter-dashboard')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400 mt-6"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Find the candidate with the most votes (winner)
  const winner = electionResults.candidates.reduce((prev, current) =>
    prev.votes > current.votes ? prev : current
  );

  return (
    <div className="bg-gray-900 text-white p-10 flex flex-col items-center min-h-screen">
      <h1 className="text-4xl text-green-400 mb-8">Election Results</h1>
      <h2 className="text-2xl text-yellow-300 mb-4">{voter.electionDetails.electionName}</h2>

      {/* Results Table */}
      <div className="overflow-x-auto w-full max-w-4xl mb-8">
        <table className="table-auto w-full text-center border-collapse border border-gray-600">
          <thead>
            <tr>
              <th className="p-4 border-b-2 border-gray-600 text-yellow-300">Candidate Name</th>
              <th className="p-4 border-b-2 border-gray-600 text-yellow-300">Votes Received</th>
              <th className="p-4 border-b-2 border-gray-600 text-yellow-300">Party Name</th>
            </tr>
          </thead>
          <tbody>
            {electionResults.candidates.map((candidate) => (
              <tr key={candidate.name} className="border-b border-gray-600">
                <td className="p-4 text-white">{candidate.name}</td>
                <td className="p-4 text-white">{candidate.votes}</td>
                <td className="p-4 text-white">{candidate.party}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Winner Announcement */}
      <div className="bg-green-700 text-white p-4 rounded shadow-md w-full max-w-4xl">
        <h3 className="text-2xl">
          🎉 The winner is: <span className="font-bold">{winner.name}</span> with {winner.votes} votes!
        </h3>
      </div>

      {/* Option to Return */}
      <button
        onClick={() => navigate('/voter-dashboard')}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400 mt-6"
      >
        Return to Dashboard
      </button>
    </div>
  );
}

export default VoterResultPage;
