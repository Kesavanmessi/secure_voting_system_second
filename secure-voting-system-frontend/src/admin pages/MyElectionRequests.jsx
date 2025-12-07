import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const MyElectionRequests = () => {
    const { admin } = useContext(AuthContext);
    const [requests, setRequests] = useState({ pending: { created: [], modified: [] }, rejected: { created: [], modified: [] } });
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'rejected'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (admin?.username) {
            fetchMyRequests();
        }
    }, [admin]);

    const fetchMyRequests = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/elections/my-requests?username=${admin.username}`);
            setRequests(response.data);
        } catch (error) {
            console.error('Error fetching my requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const RequestCard = ({ request, type, status }) => {
        const isModification = type === 'modified';
        const data = isModification ? request.updatedFields : request;
        const name = data.electionName || "Election Update";
        const date = new Date(request.createdAt).toLocaleDateString();

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-xl border backdrop-blur-md transition-all ${status === 'rejected'
                        ? 'bg-red-900/10 border-red-500/30'
                        : 'bg-blue-900/10 border-cyan-500/30'
                    }`}
            >
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="text-xl font-bold text-white">{name}</h3>
                        <p className="text-xs text-slate-400 mt-1">Submitted on {date}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'
                        }`}>
                        {status} {isModification ? 'Modification' : 'Creation'}
                    </span>
                </div>

                <div className="text-sm text-slate-300 space-y-1 mb-4">
                    <p>Start: {new Date(data.startTime).toLocaleString()}</p>
                    <p>End: {new Date(data.endTime).toLocaleString()}</p>
                </div>

                {status === 'rejected' && (
                    <div className="bg-red-950/30 p-3 rounded-lg border border-red-500/20 mt-3">
                        <h4 className="text-red-400 text-sm font-bold mb-1">Rejection Reason:</h4>
                        <p className="text-slate-300 text-sm italic">"{request.rejectionReason}"</p>
                        <p className="text-xs text-slate-500 mt-2 text-right">- {request.rejectedBy}</p>
                    </div>
                )}
            </motion.div>
        );
    };

    if (loading) return <div className="text-center p-10 text-slate-400">Loading requests...</div>;

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-8">
                    My Election Requests
                </h1>

                {/* Tabs */}
                <div className="flex space-x-1 bg-slate-800 p-1 rounded-xl w-fit mb-8">
                    {['pending', 'rejected'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                                    ? 'bg-cyan-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeTab === 'pending' ? (
                        <>
                            {requests.pending.created.length === 0 && requests.pending.modified.length === 0 && (
                                <p className="text-slate-500 col-span-2 text-center py-10">No pending requests found.</p>
                            )}
                            {requests.pending.created.map(req => <RequestCard key={req._id} request={req} type="created" status="pending" />)}
                            {requests.pending.modified.map(req => <RequestCard key={req._id} request={req} type="modified" status="pending" />)}
                        </>
                    ) : (
                        <>
                            {requests.rejected.created.length === 0 && requests.rejected.modified.length === 0 && (
                                <p className="text-slate-500 col-span-2 text-center py-10">No rejected requests found.</p>
                            )}
                            {requests.rejected.created.map(req => <RequestCard key={req._id} request={req} type="created" status="rejected" />)}
                            {requests.rejected.modified.map(req => <RequestCard key={req._id} request={req} type="modified" status="rejected" />)}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyElectionRequests;
