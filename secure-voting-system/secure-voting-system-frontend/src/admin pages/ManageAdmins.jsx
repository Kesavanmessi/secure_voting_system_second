import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from '../context/AuthContext';

const ManageAdmins = () => {
  const { admin: currentUser } = useContext(AuthContext); // Rename to avoid conflict with admin list
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAdmin, setNewAdmin] = useState({ username: "", role: "Manager Admin", password: "", adminId: "" });
  const [message, setMessage] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/admins");
      setAdmins(response.data.admins || []);
    } catch (error) {
      console.error("Error fetching admins:", error);
      showMessage("Failed to load admins.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdmin.username || !newAdmin.password || !newAdmin.adminId) {
      showMessage("All fields are required.", "error");
      return;
    }
    if (newAdmin.password.length < 8) {
      showMessage("Password must be at least 8 characters.", "error");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/admins", newAdmin);
      if (response.data.success) {
        setAdmins((prev) => [...prev, response.data.admin]);
        setNewAdmin({ username: "", role: "Manager Admin", password: "", adminId: "" });
        setIsAddMode(false);
        showMessage("Admin added successfully!", "success");
      } else {
        showMessage(response.data.message || "Admin already exists", "error");
      }
    } catch (error) {
      console.error("Error adding admin:", error);
      showMessage("Failed to add admin.", "error");
    }
  };

  const handleDelete = async (id, username) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to remove ${username}? \nThis will revoke their access and send them a notification email.`
    );

    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5000/api/admins/${id}`);
        setAdmins((prev) => prev.filter((admin) => admin.adminId !== id));
        showMessage("Admin removed and notified successfully!", "success");
      } catch (error) {
        console.error("Error deleting admin:", error);
        showMessage("Failed to remove admin.", "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Manage Administrators</h1>
            <p className="text-slate-400">Control access levels and manage system administrators.</p>
          </div>
          <button
            onClick={() => setIsAddMode(!isAddMode)}
            className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium rounded-lg shadow-lg transform transition hover:scale-105"
          >
            {isAddMode ? 'Cancel' : '+ Add New Admin'}
          </button>
        </div>

        {/* Message Toast */}
        {message && (
          <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-xl z-50 animate-fade-in-down ${message.type === 'success' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
            }`}>
            {message.text}
          </div>
        )}

        {/* Add Admin Form */}
        {isAddMode && (
          <div className="mb-10 bg-slate-800/50 backdrop-blur border border-slate-700 p-6 rounded-2xl animate-fade-in-up">
            <h3 className="text-xl font-bold text-white mb-4">Create New Administrator</h3>
            <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Username</label>
                <input
                  type="text"
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-cyan-500"
                  placeholder="e.g. johndoe"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Email / Admin ID</label>
                <input
                  type="text"
                  value={newAdmin.adminId}
                  onChange={(e) => setNewAdmin({ ...newAdmin, adminId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-cyan-500"
                  placeholder="e.g. john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Role</label>
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-cyan-500"
                >
                  <option value="Manager Admin">Manager Admin</option>
                  <option value="Support Admin">Support Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-cyan-500"
                  placeholder="Min 8 characters"
                />
              </div>
              <div className="md:col-span-2 pt-2">
                <button type="submit" className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors">
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Admins List */}
        {loading ? (
          <div className="text-center py-10 text-slate-500 animate-pulse">Loading admins...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {admins.map((admin) => (
              <div key={admin.adminId} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                    ${admin.role === 'Head Admin' ? 'bg-purple-500/20 text-purple-400' :
                      admin.role === 'Manager Admin' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-green-500/20 text-green-400'
                    }
                  `}>
                    {admin.username.charAt(0).toUpperCase()}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium border
                    ${admin.role === 'Head Admin' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' :
                      admin.role === 'Manager Admin' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' :
                        'bg-green-500/10 text-green-300 border-green-500/20'
                    }
                  `}>
                    {admin.role}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-1">{admin.username}</h3>
                <p className="text-sm text-slate-500 mb-2 truncate" title={admin.adminId}>{admin.adminId}</p>
                <div className="text-xs text-slate-500 mb-6">
                  Access: {admin.permissions && admin.permissions.length > 0 ? admin.permissions.join(', ') : 'Restricted'}
                </div>

                {admin.role !== 'Head Admin' && currentUser.role === 'Head Admin' && (
                  <button
                    onClick={() => handleDelete(admin.adminId, admin.username)}
                    className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-sm font-medium transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Remove Access
                  </button>
                )}
                {admin.role === 'Head Admin' && (
                  <div className="w-full py-2 text-center text-slate-600 text-sm italic select-none cursor-not-allowed">
                    System Protected
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default ManageAdmins;
