import { useState, useEffect } from 'react';
import axios from 'axios';


function ViewResults() {
  const [elections, setElections] = useState({
    published: [],
    notPublished: [],
  });
  const [selectedElection, setSelectedElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success'); // success or error
 // Use useNavigate here

  useEffect(() => {
    const fetchFinishedElections = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/elections/finished');
        const publishedElections = response.data.filter(e => e.isResultPublished);
        const notPublishedElections = response.data.filter(e => !e.isResultPublished);

        setElections({ published: publishedElections, notPublished: notPublishedElections });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching elections:', error);
        setMessage('Failed to load elections.');
        setMessageType('error');
        setLoading(false);
      }
    };

    fetchFinishedElections();
  }, []);

  const showResults = async (election) => {
    setMessage(null);
    try {
      const response = await axios.get(`http://localhost:5000/api/elections/results/${election._id}`);
      const resultData = response.data;
      if (resultData.success) {
        setSelectedElection({
          ...election,
          candidates: resultData.candidates,
        });
        setMessage('Displaying results for ' + election.electionName);
        setMessageType('success');
      } else {
        setMessage('Failed to fetch election results.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error fetching election results:', error);
      setMessage('Failed to fetch election results.');
      setMessageType('error');
    }
  };

  const publishResults = async (electionId) => {
    try {
      await axios.post(`http://localhost:5000/api/elections/publish/${electionId}`);
      setMessage('Results have been published!');
      setMessageType('success');
      setElections((prev) => {
        const updatedNotPublished = prev.notPublished.filter((e) => e._id !== electionId);
        const updatedPublished = prev.notPublished.filter((e) => e._id === electionId);
        return {
          published: [...prev.published, ...updatedPublished],
          notPublished: updatedNotPublished,
        };
      });
    } catch (error) {
      console.error('Error publishing results:', error);
      setMessage('Failed to publish results.');
      setMessageType('error');
    }
  };

  const moveToFinishedElections = async (electionId) => {
    try {
      await axios.post(`http://localhost:5000/api/elections/move-to-finished/${electionId}`);
      setElections((prev) => {
        const updatedPublished = prev.published.filter((e) => e._id !== electionId);
        return {
          ...prev,
          published: updatedPublished,
        };
      });
      setMessage('Election moved to finished.');
      setMessageType('success');
    } catch (error) {
      console.error('Error moving election to finished:', error);
      setMessage('Failed to move election to finished.');
      setMessageType('error');
    }
  };

  if (loading) {
    return <p className="text-white text-center">Loading elections...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-10">
      <h1 className="text-4xl mb-10 text-green-500">View Results</h1>
      {message && (
        <p
          className={`mb-4 p-4 rounded ${messageType === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
        >
          {message}
        </p>
      )}
      <div className="w-full max-w-4xl">
        {elections.notPublished.length === 0 && elections.published.length === 0 && (
          <h1 className="text-4xl mb-10 text-red-500">There are no elections with results available.</h1>
        )}
        {/* Display Elections */}
        {elections.notPublished.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl mb-4">Elections with Results (Not Published)</h2>
            {elections.notPublished.map((election) => (
              <div key={election._id} className="flex justify-between items-center mb-5">
                <span className="text-xl">{election.electionName}</span>
                <button
                  onClick={() => showResults(election)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400"
                >
                  Get Results
                </button>
              </div>
            ))}
          </div>
        )}

        {elections.published.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl mb-4">Elections with Published Results</h2>
            {elections.published.map((election) => (
              <div key={election._id} className="flex justify-between items-center mb-5">
                <span className="text-xl">{election.electionName}</span>
                <button
                  onClick={() => showResults(election)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-400"
                >
                  View Result
                </button>
                <button
                  onClick={() => moveToFinishedElections(election._id)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-400"
                >
                  Move to Finished Elections
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Show Results for the selected election */}
        {selectedElection && (
          <div className="mt-10">
            <h2 className="text-3xl mb-4">Results for {selectedElection.electionName}</h2>
            <table className="table-auto w-full text-center border-collapse border border-gray-600">
              <thead>
                <tr>
                  <th className="p-4 border-b-2 border-gray-600">Candidate Name</th>
                  <th className="p-4 border-b-2 border-gray-600">Votes Gained</th>
                  <th className="p-4 border-b-2 border-gray-600">Party</th>
                </tr>
              </thead>
              <tbody>
                {selectedElection.candidates.map((candidate, index) => (
                  <tr key={index} className="border-b border-gray-600">
                    <td className="p-4">{candidate.name}</td>
                    <td className="p-4">{candidate.votes}</td>
                    <td className="p-4">{candidate.party}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-5 text-lg">
              <h3 className="text-green-400">
                Winner:{' '}
                {selectedElection.candidates.reduce((prev, current) =>
                  prev.votes > current.votes ? prev : current
                ).name}
              </h3>
              {!selectedElection.isResultPublished && (
                <button
                  onClick={() => publishResults(selectedElection._id)}
                  className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-400"
                >
                  Publish Results
                </button>
              )}
              {selectedElection.isResultPublished && <p className="text-yellow-400 mt-2">Results have been published!</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewResults;
