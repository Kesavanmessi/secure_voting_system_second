import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

function ManageElection() {
  const { admin } = useContext(AuthContext);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingElection, setEditingElection] = useState(null);
  const [editFormData, setEditFormData] = useState({
    startTime: '',
    endTime: ''
  });

  useEffect(() => {
    fetchElections();
  }, [admin]);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/elections/fetching');
      setElections(response.data);
    } catch (error) {
      setError('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const getElectionStatus = (start, end) => {
    const now = new Date();
    const startTime = new Date(start);
    const endTime = new Date(end);

    if (now < startTime) return 'Upcoming';
    if (now >= startTime && now <= endTime) return 'Running';
    return 'Finished';
  };

  const handleDelete = async (id, name) => {
    const confirmation = prompt(`To delete "${name}" and notify all voters, type the election name:`);
    if (confirmation === name) {
      try {
        await axios.delete(`http://localhost:5000/api/elections/trash`, { params: { id } });
        setElections(elections.filter((e) => e._id !== id));
        alert('Election deleted and voters notified.');
      } catch (error) {
        console.error('Error deleting election:', error);
        alert('Failed to delete election.');
      }
    }
  };

  const openEditModal = (election) => {
    setEditingElection(election);
    // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
    const formatForInput = (dateString) => {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    };

    setEditFormData({
      startTime: formatForInput(election.startTime),
      endTime: formatForInput(election.endTime)
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingElection) return;

    try {
      // We need to send all fields required by the backend, or the backend overwrites them with undefined.
      // Fetching the singular election details to ensure we have everything might be safer, 
      // but we iterate over 'elections' which should have most data. 
      // Note: The /fetching endpoint might not return lists if they are large, check backend.
      // Backend /fetching returns strictly the election document.

      const payload = {
        ...editingElection, // Spread existing fields (electionName, description, lists, etc.)
        startTime: editFormData.startTime,
        endTime: editFormData.endTime,
        voters: editingElection.voterLists, // Backend expects 'voters' in body but schema has 'voterLists'
        candidates: editingElection.candidateLists // Backend expects 'candidates' in body
      };

      await axios.put(`http://localhost:5000/api/elections/one/${editingElection._id}`, payload);

      alert('Election updated and voters notified.');
      setIsEditModalOpen(false);
      setEditingElection(null);
      fetchElections(); // Refresh list
    } catch (error) {
      console.error('Error updating election:', error);
      alert('Failed to update election.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Manage Elections</h1>
            <p className="text-slate-400">Monitor and control election lifecycles</p>
          </div>
          {/* Legend */}
          <div className="flex gap-4 text-sm font-medium bg-slate-800 p-3 rounded-lg border border-slate-700">
            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span> Upcoming</div>
            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span> Running</div>
            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-slate-500 mr-2"></span> Finished</div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 animate-pulse">Loading elections data...</div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">{error}</div>
        ) : elections.length === 0 ? (
          <div className="text-center py-20 text-slate-500 bg-slate-800/50 rounded-2xl border border-dotted border-slate-700">
            No elections found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections.map((election) => {
              const status = getElectionStatus(election.startTime, election.endTime);
              const isUpcoming = status === 'Upcoming';
              const isHeadAdmin = admin.role === 'Head Admin';
              const isCreator = election.createdBy === admin.username;

              // Access Control logic from requirements:
              // Head Admin: All access.
              // Manager Admin: Only own created.
              // Logic was: if not started & not head admin & not creator -> hide?
              // The new requirement says "manage election should show the current elections...".
              // Assuming showing all but actions restricted is better for transparency, 
              // BUT previous logic hid them. Let's stick to hiding if irrelevant for now or just show all but disable actions?
              // "Head Admin it should all options... Manager Admin should show... elections details" is a bit vague.
              // Sticking to: Show all, but restrict actions.

              return (
                <div key={election._id} className="group relative bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300">
                  {/* Status Badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                    ${status === 'Upcoming' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : ''}
                    ${status === 'Running' ? 'bg-green-500/20 text-green-400 border border-green-500/20 animate-pulse' : ''}
                    ${status === 'Finished' ? 'bg-slate-700 text-slate-400 border border-slate-600' : ''}
                  `}>
                    {status}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 pr-20 truncate">{election.electionName}</h3>
                  <div className="space-y-2 text-sm text-slate-400 mb-6">
                    <p><span className="text-slate-500">Starts:</span> {new Date(election.startTime).toLocaleString()}</p>
                    <p><span className="text-slate-500">Ends:</span> {new Date(election.endTime).toLocaleString()}</p>
                    <p><span className="text-slate-500">Created By:</span> {election.createdBy}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto">
                    {/* View Details / Manage Link */}
                    {status !== 'Upcoming' ? (
                      <Link
                        to={`/admin-dashboard/manage-election/${election._id}`}
                        className="flex-1 text-center py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm font-medium transition-colors"
                      >
                        View Details
                      </Link>
                    ) : (
                      // Actions for Upcoming Elections
                      (isHeadAdmin || isCreator) ? (
                        <>
                          <button
                            onClick={() => openEditModal(election)}
                            className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm font-medium transition-colors"
                          >
                            Edit Time
                          </button>
                          <button
                            onClick={() => handleDelete(election._id, election.electionName)}
                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-500 italic flex-1 text-center py-2">Read Only</span>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-white mb-4">Edit Election Schedule</h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    value={editFormData.startTime}
                    onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    value={editFormData.endTime}
                    onChange={(e) => setEditFormData({ ...editFormData, endTime: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div className="text-xs text-yellow-500 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                  Warning: Changing the schedule will automatically notify all registered voters via email.
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ManageElection;
