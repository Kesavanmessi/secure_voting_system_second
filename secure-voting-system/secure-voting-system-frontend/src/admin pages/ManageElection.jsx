import { useState } from 'react';
import { Link } from 'react-router-dom';

function ManageElection() {
  const [elections, setElections] = useState([ {
    id: 1,
    name: 'Presidential Election 2024',
    candidates: ['Alice Johnson', 'Bob Smith'],
    voters: ['John Doe', 'Jane Doe'],
    startTime: '2024-01-01T09:00',
    endTime: '2024-01-01T17:00'
  },
  {
    id: 2,
    name: 'Local City Council Election',
    candidates: ['Tom Brown', 'Sara White'],
    voters: ['Emily Clark', 'Mike Johnson'],
    startTime: '2024-05-15T09:00',
    endTime: '2024-05-15T17:00'
  },
  {
    id: 3,
    name: 'School Board Election',
    candidates: ['Laura Green', 'Mark Blue'],
    voters: ['Alice Brown', 'Charlie Black'],
    startTime: '2024-09-01T09:00',
    endTime: '2024-09-01T17:00'
  }]);

  const handleDelete = (id) => {
    const updatedElections = elections.filter(election => election.id !== id);
    setElections(updatedElections);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-10">
      <h1 className="text-4xl mb-10 text-green-500">Manage Elections</h1>
      <div className="w-full max-w-4xl">
        {elections.length === 0 ? (
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
                <tr key={election.id} className="border-b border-gray-600">
                  <td className="p-4">{election.name}</td>
                  <td className="p-4 flex justify-center gap-4">
                    <Link
                      to={`/admin-dashboard/manage-election/${election.id}`} // Route to manage single election
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400"
                    >
                      Manage
                    </Link>
                    <button
                      onClick={() => handleDelete(election.id)}
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
