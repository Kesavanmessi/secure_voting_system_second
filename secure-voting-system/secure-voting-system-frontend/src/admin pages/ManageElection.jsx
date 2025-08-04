import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

function ManageElection() {
  const { admin } = useContext(AuthContext); // Access admin info from context
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/elections/fetching');
        const allElections = response.data;
        const currentTime = new Date();
  
        const filteredElections = allElections.filter((election) => {
          const startTime = new Date(election.startTime);
          const endTime = new Date(election.endTime);
  
          const isOngoing = currentTime >= startTime && currentTime <= endTime;
          const isEnded = currentTime > endTime;
  
          if (admin.role === 'Head Admin') {
            // Head Admin: Include all except ended elections
            return !isEnded;
          } else {
            // Other Admins: Include only ongoing elections or created elections that haven't ended
            return (isOngoing || election.createdBy === admin.username) && !isEnded;
          }
        });
  
        setElections(filteredElections);
      } catch (error) {
        setError('Failed to load elections');
      } finally {
        setLoading(false);
      }
    };
  
    fetchElections();
  }, [admin]);
  

  const handleDelete = async (id, name) => {
    const confirmation = prompt(`To confirm, type the name of the election: "${name}"`);

    if (confirmation === name) {
      try {
        await axios.delete(`http://localhost:5000/api/elections/trash`, { params: { id } });
        setElections(elections.filter((election) => election._id !== id));
        alert(`${name} has been deleted successfully.`);
      } catch (error) {
        console.error('Error deleting election:', error);
      }
    } else {
      alert('Deletion cancelled or incorrect election name entered.');
    }
  };

  const handleOngoingClick = async (id) => {
    console.log(id)
    try {
      const response = await axios.get(`http://localhost:5000/api/elections/ongoing-details`, {
        params: { electionId: id },
      });

      const { voterCount, totalVoters, electionDetails } = response.data;
      alert(
        `Election: ${electionDetails.electionName}\n` +
        `Total Voters: ${totalVoters}\n` +
        `Voters Who Have Voted: ${voterCount}\n` +
        `Start Time: ${new Date(electionDetails.startTime).toLocaleString()}\n` +
        `End Time: ${new Date(electionDetails.endTime).toLocaleString()}`
      );
    } catch (error) {
      console.error('Error fetching ongoing election details:', error);
      alert('Failed to fetch ongoing election details.');
    }
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
  {elections.map((election) => {
    const currentTime = new Date();
    const startTime = new Date(election.startTime);
    const endTime = new Date(election.endTime);
    const isOngoing = currentTime >= startTime && currentTime <= endTime;
    const isNotStarted = currentTime < startTime;

    // Check access for not-started elections
    if (
      isNotStarted &&
      admin.role !== 'Head Admin' &&
      election.createdBy !== admin.username
    ) {
      return null; // Skip rendering if the election is not started and the admin didn't create it
    }

    return (
      <tr key={election._id} className="border-b border-gray-600">
        <td className="p-4">{election.electionName}</td>
        <td className="p-4 flex justify-center gap-4">
          {isOngoing ? (
            <button
              onClick={() => handleOngoingClick(election._id)}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-400"
            >
              Ongoing
            </button>
          ) : (
            <Link
              to={`/admin-dashboard/manage-election/${election._id}`} // Route to manage single election
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400"
            >
              Manage
            </Link>
          )}

          {/* Only Head Admin can delete non-ongoing elections */}
          {admin.role === 'Head Admin' && !isOngoing && (
            <button
              onClick={() => handleDelete(election._id, election.electionName)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-400 flex items-center"
            >
              <i className="fas fa-trash-alt mr-2"></i> Trash
            </button>
          )}
        </td>
      </tr>
    );
  })}
</tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ManageElection;
