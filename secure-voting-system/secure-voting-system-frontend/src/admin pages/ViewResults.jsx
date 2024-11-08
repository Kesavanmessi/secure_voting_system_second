import  { useState } from 'react';

function ViewResults() {
  // Sample data: Replace this with your actual data fetching logic
  const [elections, setElections] = useState([
    {
      id: 1,
      name: 'Presidential Election 2024',
      candidates: [
        { name: 'Alice Johnson', votes: 200 },
        { name: 'Bob Smith', votes: 150 },
      ],
      isEnded: true, // Indicates whether the election has ended
    },
    {
      id: 2,
      name: 'Local City Council Election',
      candidates: [
        { name: 'Charlie Brown', votes: 300 },
        { name: 'Emily Davis', votes: 250 },
      ],
      isEnded: true,
    },
    // Add more elections as necessary
  ]);

  const [selectedElection, setSelectedElection] = useState(null);
  const [published, setPublished] = useState(false);

  const showResults = (election) => {
    setSelectedElection(election);
  };

  const publishResults = () => {
    // Logic to publish results (e.g., update database)
    setPublished(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-10">
      <h1 className="text-4xl mb-10 text-green-500">View Results</h1>

      <div className="w-full max-w-4xl">
        {elections.filter(e => e.isEnded).length === 0 ? (
          <p className="text-center text-2xl">No results available.</p>
        ) : (
          elections.filter(e => e.isEnded).map((election) => (
            <div key={election.id} className="flex justify-between items-center mb-5">
              <span className="text-xl">{election.name}</span>
              <button
                onClick={() => showResults(election)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400"
              >
                Show Results
              </button>
            </div>
          ))
        )}

        {selectedElection && (
          <div className="mt-10">
            <h2 className="text-3xl mb-4">Results for {selectedElection.name}</h2>
            <table className="table-auto w-full text-center border-collapse border border-gray-600">
              <thead>
                <tr>
                  <th className="p-4 border-b-2 border-gray-600">Candidate Name</th>
                  <th className="p-4 border-b-2 border-gray-600">Votes Gained</th>
                </tr>
              </thead>
              <tbody>
                {selectedElection.candidates.map((candidate, index) => (
                  <tr key={index} className="border-b border-gray-600">
                    <td className="p-4">{candidate.name}</td>
                    <td className="p-4">{candidate.votes}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-5 text-lg">
              <h3 className="text-green-400">
                Winner: {selectedElection.candidates.reduce((prev, current) => (prev.votes > current.votes) ? prev : current).name}
              </h3>
              <button
                onClick={publishResults}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-400"
              >
                Publish Results
              </button>
              {published && <p className="text-yellow-400 mt-2">Results have been published!</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewResults;
