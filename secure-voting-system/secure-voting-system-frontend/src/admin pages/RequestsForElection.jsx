import { useState, useEffect , useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const RequestsForElection = () => {
  const [createdRequests, setCreatedRequests] = useState([]);
  const [modifiedRequests, setModifiedRequests] = useState([]);
  const [viewedElection, setViewedElection] = useState(null);
  const [viewedModifiedElection, setViewedModifiedElection] = useState(null);
  const [difference, setDifference] = useState(null);
  const { admin } = useContext(AuthContext);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const createdResponse = await axios.get('http://localhost:5000/api/elections/pending');
        const modifiedResponse = await axios.get('http://localhost:5000/api/elections/pending-modifications');
        setCreatedRequests(createdResponse.data);
        setModifiedRequests(modifiedResponse.data);
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };
    fetchRequests();
  }, []);

  const handleAcceptCreatedRequest = async (requestId) => {
    try {
      await axios.put(`http://localhost:5000/api/elections/approve/${requestId}`, {
        // Assuming you need to pass the approving admin's name
        name: admin.username  // Replace with dynamic admin name if available in your context
      });
      
      setCreatedRequests((prev) => prev.filter(request => request._id !== requestId));
      setViewedElection(null);
      console.log('Election approved successfully');
    } catch (error) {
      console.error('Error accepting created election request:', error);
    }
  };
  

  const handleRejectCreatedRequest = async (requestId) => {
    try {
      await axios.delete(`http://localhost:5000/api/elections/reject-created/${requestId}`);
      setCreatedRequests((prev) => prev.filter(request => request._id !== requestId));
      setViewedElection(null);
    } catch (error) {
      console.error('Error rejecting created election request:', error);
    }
  };

  const handleViewCreatedRequest = (election) => {
    setViewedElection(election);
  };

  const handleAcceptModifiedRequest = async (requestId) => {
    try {
      await axios.put(`http://localhost:5000/api/elections/approve-modification/${requestId}`, {
        // Assuming you may need to pass the approving admin's name
        name: admin.username  // Replace with dynamic admin name if available
      });
      
      setModifiedRequests((prev) => prev.filter(request => request._id !== requestId));
      setViewedModifiedElection(null);
      console.log('Modified election approved successfully');
    } catch (error) {
      console.error('Error accepting modified election request:', error);
    }
  };
  

  const handleRejectModifiedRequest = async (requestId) => {
    try {
      await axios.delete(`http://localhost:5000/api/elections/reject-modification/${requestId}`);
      setModifiedRequests((prev) => prev.filter(request => request._id !== requestId));
      setViewedModifiedElection(null);
    } catch (error) {
      console.error('Error rejecting modified election request:', error);
    }
  };

  const handleViewModifiedRequest = (request) => {
    setViewedModifiedElection(request);
  };
  const handleViewDifference = async (request) => {
    console.log(request);
    try {
      const { data } = await axios.get(`http://localhost:5000/api/elections/difference/${request.
        originalElectionId
        }`);
      setDifference(data.differences);
    } catch (error) {
      console.error('Error fetching difference:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-4xl mb-5 text-green-400">Requests for Election</h1>
      
      {/* Created Election Requests */}
      <section className="mb-10">
        <h2 className="text-3xl mb-3 text-yellow-400">Created Election Requests</h2>
        {createdRequests.length === 0 ? (
          <p>No created election requests</p>
        ) : (
          createdRequests.map((request) => (
            <div key={request._id} className="p-4 bg-gray-800 rounded mb-3">
              <p><strong>Election Name:</strong> {request.electionName}</p>
              <div className="flex gap-4 mt-3">
                <button
                  onClick={() => handleViewCreatedRequest(request)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  View
                </button>
                <button
                  onClick={() => handleAcceptCreatedRequest(request._id)}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRejectCreatedRequest(request._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Modified Election Requests */}
      <section>
        <h2 className="text-3xl mb-3 text-yellow-400">Modified Election Requests</h2>
        {modifiedRequests.length === 0 ? (
          <p>No modified election requests</p>
        ) : (
          modifiedRequests.map((request) => (
            <div key={request._id} className="p-4 bg-gray-800 rounded mb-3">
              <p><strong>Election Name:</strong> {request.updatedFields.electionName}</p>
              <div className="flex gap-4 mt-3">
                <button
                  onClick={() => handleViewModifiedRequest(request)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  View
                </button>
                <button
                  onClick={() => handleAcceptModifiedRequest(request._id)}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRejectModifiedRequest(request._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleViewDifference(request)}
                  className="bg-purple-500 text-white px-3 py-1 rounded"
                >
                  Difference
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* View Election Details */}
      {viewedElection && (
        <div className="p-4 bg-gray-800 rounded mt-5">
          <h3 className="text-2xl text-green-400">Election Details</h3>
          <p><strong>Election Name:</strong> {viewedElection.electionName}</p>
          <pre>{JSON.stringify(viewedElection, null, 2)}</pre>
        </div>
      )}

      {/* View Modified Election Details */}
      {viewedModifiedElection && (
        <div className="p-4 bg-gray-800 rounded mt-5">
          <h3 className="text-2xl text-green-400">Modified Election Details</h3>
          <p><strong>Modified By:</strong> {viewedModifiedElection.modifiedBy}</p>
          <pre>{JSON.stringify(viewedModifiedElection.updatedFields, null, 2)}</pre>
        </div>
      )}

      {/* Difference View */}
      {difference && (
        <div className="p-4 bg-gray-800 rounded mt-5">
          <h3 className="text-2xl text-green-400">Differences</h3>
          <pre>{JSON.stringify(difference, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default RequestsForElection;
