import { useNavigate } from 'react-router-dom';

function VoterResultPage( ) {
  const navigate = useNavigate();
  const electionResults = {
    electionName: 'Presidential Election 2024',
    isPublished: true,  // Whether the results are published or not
    candidates: [
      { id: 1, name: 'Candidate 1', votes: 150 },
      { id: 2, name: 'Candidate 2', votes: 200 },
      { id: 3, name: 'Candidate 3', votes: 100 },
    ]
  };
  
  if (!electionResults || !electionResults.isPublished) {
    return (
      <div className="bg-gray-900 text-white p-10 flex flex-col items-center min-h-screen">
        <h1 className="text-4xl text-red-400 mb-8">Results Not Available</h1>
        <p className="text-lg text-gray-400">
          The results of this election are not yet published. Please check again later.
        </p>
      </div>
    );
  }

  // Find the candidate with the most votes (winner)
  const winner = electionResults.candidates.reduce((prev, current) => {
    return (prev.votes > current.votes) ? prev : current;
  });

  return (
    <div className="bg-gray-900 text-white p-10 flex flex-col items-center min-h-screen">
      <h1 className="text-4xl text-green-400 mb-8">Election Results</h1>
      <h2 className="text-2xl text-yellow-300 mb-4">{electionResults.electionName}</h2>

      {/* Results Table */}
      <table className="table-auto w-full max-w-4xl text-center mb-8">
        <thead>
          <tr>
            <th className="p-4 border-b-2 border-gray-600">Candidate Name</th>
            <th className="p-4 border-b-2 border-gray-600">Votes Received</th>
          </tr>
        </thead>
        <tbody>
          {electionResults.candidates.map((candidate) => (
            <tr key={candidate.id} className="border-b border-gray-600">
              <td className="p-4">{candidate.name}</td>
              <td className="p-4">{candidate.votes}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Winner Announcement */}
      <h3 className="text-2xl text-green-400 mb-4">
        The winner is: <span className="font-bold">{winner.name}</span> with {winner.votes} votes!
      </h3>

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
