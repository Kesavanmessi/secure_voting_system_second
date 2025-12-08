import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const RequestsForElection = () => {
  const { admin } = useContext(AuthContext);
  const [createdRequests, setCreatedRequests] = useState([]);
  const [modifiedRequests, setModifiedRequests] = useState([]);
  const [viewedElection, setViewedElection] = useState(null);
  const [viewedModifiedElection, setViewedModifiedElection] = useState(null);
  const [difference, setDifference] = useState(null);

  // Rejection Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectingType, setRejectingType] = useState(null); // 'created' or 'modified'
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const createdResponse = await axios.get('https://secure-voting-system-second.onrender.com/api/elections/pending');
      const modifiedResponse = await axios.get('https://secure-voting-system-second.onrender.com/api/elections/pending-modifications');
      setCreatedRequests(createdResponse.data);
      setModifiedRequests(modifiedResponse.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleAcceptCreatedRequest = async (requestId) => {
    try {
      await axios.put(`https://secure-voting-system-second.onrender.com/api/elections/approve/${requestId}`, {
        name: admin.username
      });
      setCreatedRequests((prev) => prev.filter(request => request._id !== requestId));
      setViewedElection(null);
      alert('Election approved successfully');
    } catch (error) {
      console.error('Error accepting created election request:', error);
      alert('Failed to approve election.');
    }
  };

  const openRejectModal = (id, type) => {
    setRejectingId(id);
    setRejectingType(type);
    setRejectionReason("");
    setIsRejectModalOpen(true);
  };

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      alert("Please enter a reason for rejection.");
      return;
    }

    try {
      const endpoint = rejectingType === 'created'
        ? `https://secure-voting-system-second.onrender.com/api/elections/reject-created/${rejectingId}`
        : `https://secure-voting-system-second.onrender.com/api/elections/reject-modification/${rejectingId}`;

      await axios.post(endpoint, {
        reason: rejectionReason,
        rejectedBy: admin.username
      });

      if (rejectingType === 'created') {
        setCreatedRequests((prev) => prev.filter(request => request._id !== rejectingId));
        setViewedElection(null);
      } else {
        setModifiedRequests((prev) => prev.filter(request => request._id !== rejectingId));
        setViewedModifiedElection(null);
      }

      setIsRejectModalOpen(false);
      setRejectingId(null);
      setRejectingType(null);
      alert('Request rejected successfully.');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request.');
    }
  };

  const handleAcceptModifiedRequest = async (requestId) => {
    try {
      await axios.put(`https://secure-voting-system-second.onrender.com/api/elections/approve-modification/${requestId}`, {
        name: admin.username
      });
      setModifiedRequests((prev) => prev.filter(request => request._id !== requestId));
      setViewedModifiedElection(null);
      alert('Modified election approved successfully');
    } catch (error) {
      console.error('Error accepting modified election request:', error);
      alert('Failed to approve modification.');
    }
  };

  const handleViewDifference = async (request) => {
    try {
      const { data } = await axios.get(`https://secure-voting-system-second.onrender.com/api/elections/difference/${request.originalElectionId}`);
      setDifference(data.differences);
      setViewedModifiedElection(request); // Also set this to show details
      setViewedElection(null);
    } catch (error) {
      console.error('Error fetching difference:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-10">Election Requests</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Created Election Requests */}
          <section className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center">
              <span className="bg-cyan-500/10 p-2 rounded-lg mr-3">🆕</span>
              New Elections
              <span className="ml-auto text-sm bg-slate-700 text-slate-300 px-3 py-1 rounded-full">{createdRequests.length}</span>
            </h2>

            <div className="space-y-4">
              {createdRequests.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No pending requests</p>
              ) : (
                createdRequests.map((request) => (
                  <div key={request._id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-white text-lg">{request.electionName}</h3>
                        <p className="text-sm text-slate-400">By: {request.createdBy}</p>
                      </div>
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Pending</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => { setViewedElection(request); setViewedModifiedElection(null); setDifference(null); }}
                        className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm text-white transition-colors"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleAcceptCreatedRequest(request._id)}
                        className="flex-1 py-2 bg-green-600 hover:bg-green-500 rounded text-sm text-white transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => openRejectModal(request._id, 'created')}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded text-sm text-white transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Modified Election Requests */}
          <section className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center">
              <span className="bg-yellow-500/10 p-2 rounded-lg mr-3">✏️</span>
              Modification Requests
              <span className="ml-auto text-sm bg-slate-700 text-slate-300 px-3 py-1 rounded-full">{modifiedRequests.length}</span>
            </h2>

            <div className="space-y-4">
              {modifiedRequests.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No pending modifications</p>
              ) : (
                modifiedRequests.map((request) => (
                  <div key={request._id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 hover:border-yellow-500/50 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-white text-lg">{request.updatedFields.electionName || "Unnamed Update"}</h3>
                        <p className="text-sm text-slate-400">By: {request.modifiedBy}</p>
                      </div>
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">Modified</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDifference(request)}
                        className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 rounded text-sm text-white transition-colors"
                      >
                        Diff
                      </button>
                      <button
                        onClick={() => handleAcceptModifiedRequest(request._id)}
                        className="flex-1 py-2 bg-green-600 hover:bg-green-500 rounded text-sm text-white transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => openRejectModal(request._id, 'modified')}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded text-sm text-white transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Details View Area */}
        {(viewedElection || viewedModifiedElection || difference) && (
          <div className="mt-10 bg-slate-800 p-8 rounded-2xl border border-slate-700 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Request Details</h2>
              <button
                onClick={() => { setViewedElection(null); setViewedModifiedElection(null); setDifference(null); }}
                className="text-slate-400 hover:text-white"
              >
                Close ✕
              </button>
            </div>

            {viewedElection && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 text-sm">Election Name</span>
                    <p className="text-lg font-medium">{viewedElection.electionName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-sm">Creator</span>
                    <p className="text-lg font-medium">{viewedElection.createdBy}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-sm">Start Time</span>
                    <p>{new Date(viewedElection.startTime).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-sm">End Time</span>
                    <p>{new Date(viewedElection.endTime).toLocaleString()}</p>
                  </div>
                </div>
                <div className="bg-slate-900 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-xs text-green-300">{JSON.stringify(viewedElection, null, 2)}</pre>
                </div>
              </div>
            )}

            {difference && (
              <div>
                <h3 className="text-xl text-purple-400 mb-4">Change Log</h3>
                <div className="space-y-4">
                  {Object.entries(difference).map(([key, val]) => (
                    <div key={key} className="grid grid-cols-2 gap-4 p-4 bg-slate-900 rounded-lg border border-slate-700">
                      <div>
                        <span className="block text-xs uppercase text-slate-500 mb-1">Old {key}</span>
                        <div className="text-red-300 break-all">{JSON.stringify(val.original)}</div>
                      </div>
                      <div>
                        <span className="block text-xs uppercase text-slate-500 mb-1">New {key}</span>
                        <div className="text-green-300 break-all font-bold">{JSON.stringify(val.modified)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-2">Reject Request</h2>
            <p className="text-slate-400 text-sm mb-4">Please provide a reason for rejection. This will be visible to the manager.</p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-red-500 outline-none h-32 resize-none mb-6"
              placeholder="Enter rejection reason..."
            ></textarea>

            <div className="flex gap-3">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitRejection}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RequestsForElection;
