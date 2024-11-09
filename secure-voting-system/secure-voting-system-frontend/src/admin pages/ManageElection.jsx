import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function ManageElection() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch elections from the backend
  useEffect(() => {
    axios.get('/api/elections')  // Adjust the URL to your backend endpoint
      .then((response) => {
        setElections(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError('Failed to load elections');
        setLoading(false);
      });
  }, []);

  const handleDelete = (id) => {
    // Here, you would call an API to delete the election
    // After deletion, you can update the state to remove the deleted election
    const updatedElections = elections.filter(election => election.id !== id);
    setElections(updatedElections);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-10">
      <h1 className="text-4xl mb-10 text-green-500">Manage Elections</h1>
      <div className="w-full max-w-4xl">
        {loading ? (
          <p className="text-center text-2xl">Loading elections...</p>
        ) : error ? (
          <p className="text-center text-2xl text-red-500">{error}</p>
        ) : elections.length === 0 ? (
          <p className="text-center text-2xl">No elections available.</p>
        ) : (
          <table className="table-auto w-full text-center">
            <thead>
              <tr>
                <th className="p-4 border-b-2 border-gray-600">Election Name</th>
                <th className="p-4 border-b-2 border-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {elections.map((election) => (
                <tr key={election._id} className="border-b border-gray-600">
                  <td className="p-4">{election.name}</td>
                  <td className="p-4 flex justify-center gap-4">
                    <Link
                      to={`/admin-dashboard/manage-election/${election._id}`} // Route to manage single election
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400"
                    >
                      Manage
                    </Link>
                    <button
                      onClick={() => handleDelete(election._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-400 flex items-center"
                    >
                      <i className="fas fa-trash-alt mr-2"></i> Trash
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ManageElection;
