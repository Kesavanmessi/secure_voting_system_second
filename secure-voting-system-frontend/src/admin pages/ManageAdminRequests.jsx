import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const ManageAdminRequests = () => {
    const [requests, setRequests] = useState([]);
    const [message, setMessage] = useState(null);
    const { admin } = useContext(AuthContext);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admins/pending/requests');
            if (response.data.success) {
                setRequests(response.data.requests);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
            showMessage('Error fetching requests.', 'error');
        }
    };

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleApprove = async (id) => {
        try {
            const response = await axios.post(`http://localhost:5000/api/admins/approve-signup/${id}`);
            if (response.data.success) {
                showMessage(response.data.message, 'success');
                fetchRequests(); // Refresh list
            }
        } catch (error) {
            console.error('Error approving request:', error);
            showMessage('Error approving request.', 'error');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Are you sure you want to reject this request?")) return;
        try {
            const response = await axios.delete(`http://localhost:5000/api/admins/reject-signup/${id}`);
            if (response.data.success) {
                showMessage(response.data.message, 'success');
                fetchRequests(); // Refresh list
            }
        } catch (error) {
            console.error('Error rejecting request:', error);
            showMessage('Error rejecting request.', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                <header>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-500">
                        Admin Approval Requests
                    </h1>
                    <p className="text-slate-400 mt-2">Manage incoming signup requests for new administrators.</p>
                </header>

                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl text-center font-semibold backdrop-blur-md shadow-lg border ${message.type === 'success'
                                ? 'bg-green-500/20 text-green-300 border-green-500/50'
                                : 'bg-red-500/20 text-red-300 border-red-500/50'
                            }`}
                    >
                        {message.text}
                    </motion.div>
                )}

                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/50 border-b border-slate-700">
                                <tr>
                                    <th className="py-4 px-6 text-slate-400 font-medium uppercase text-xs tracking-wider">Username</th>
                                    <th className="py-4 px-6 text-slate-400 font-medium uppercase text-xs tracking-wider">Email</th>
                                    <th className="py-4 px-6 text-slate-400 font-medium uppercase text-xs tracking-wider">Requested Role</th>
                                    <th className="py-4 px-6 text-slate-400 font-medium uppercase text-xs tracking-wider">Date</th>
                                    <th className="py-4 px-6 text-center text-slate-400 font-medium uppercase text-xs tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {requests.length > 0 ? (
                                    requests.map((req) => (
                                        <tr key={req._id} className="hover:bg-slate-700/20 transition-colors">
                                            <td className="py-4 px-6 font-semibold text-white">{req.username}</td>
                                            <td className="py-4 px-6 text-slate-300">{req.email}</td>
                                            <td className="py-4 px-6">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${req.role === 'Manager Admin' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                        'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    }`}>
                                                    {req.role}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-slate-400 text-sm">{new Date(req.createdAt).toLocaleDateString()}</td>
                                            <td className="py-4 px-6 flex justify-center gap-3">
                                                <button
                                                    onClick={() => handleApprove(req._id)}
                                                    className="px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 transition-all font-medium text-sm"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(req._id)}
                                                    className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-all font-medium text-sm"
                                                >
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-slate-500 italic">
                                            No pending signup requests found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageAdminRequests;
