import { useState, useEffect } from "react";
import axios from "axios";

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ username: "", role: "Manager Admin", password: "" ,adminId:""});
  const [message, setMessage] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admins");
        setAdmins(response.data.admins || []);
      } catch (error) {
        console.error("Error fetching admins:", error);
        setMessage({ text: "Failed to load admins.", type: "error" });
      }
    };

    fetchAdmins();
  }, []);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const addAdmin = async () => {
    if (!newAdmin.username || !newAdmin.password || !newAdmin.adminId) {
      showMessage("All fields are required to add an admin.", "error");
      return;
    }
    if(newAdmin.password.length < 8)
    {
      showMessage("Password length must be atleast 8","error");return;
    }
    try {
      const response = await axios.post("http://localhost:5000/api/admins", newAdmin);
      if(response.data.success){
      setAdmins((prev) => [...prev, response.data.admin]);
      setNewAdmin({ username: "", role: "Manager Admin", password: "" ,adminId:""});
      showMessage("Admin added successfully!", "success");return}
      showMessage("Admin with this name or Admin id is already exist","error");

    } catch (error) {
      console.error("Error adding admin:", error);
      showMessage("Failed to add admin. Please try again.", "error");
    }
  };

  const updateAdmin = async () => {
    if (!editingAdmin.username || !editingAdmin.role) {
      showMessage("All fields are required to update an admin.", "error");
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/admins/${editingAdmin.adminId}`, editingAdmin);
      setAdmins((prev) =>
        prev.map((admin) => (admin.adminId === editingAdmin.adminId ? editingAdmin : admin))
      );
      setEditingAdmin(null);
      showMessage("Admin updated successfully!", "success");
    } catch (error) {
      console.error("Error updating admin:", error);
      showMessage("Failed to update admin. Please try again.", "error");
    }
  };

  const deleteAdmin = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admins/${id}`);
      setAdmins((prev) => prev.filter((admin) => admin.adminId !== id));
      showMessage("Admin deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting admin:", error);
      showMessage("Failed to delete admin. Please try again.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center">
      <div className="w-full max-w-4xl p-10 bg-gray-800 rounded-lg">
        <h2 className="text-3xl text-green-500 mb-5">Manage Admins</h2>

        {message && (
          <div
            className={`mb-5 p-3 rounded ${
              message.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        <h3 className="text-xl text-blue-400 mb-4">Existing Admins</h3>
        <table className="table-auto w-full text-center mb-5">
          <thead>
            <tr>
              <th className="p-2 border-b">Username</th>
              <th className="p-2 border-b">Admin Id</th>
              <th className="p-2 border-b">Role</th>
              <th className="p-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.adminId} className="border-b">
                <td className="p-2">{admin.username}</td>
                <td className="p-2">{admin.adminId}</td>
                <td className="p-2">{admin.role}</td>
                <td className="p-2">
                  {admin.role !== "Head Admin" && (
                    <>
                      <button
                        className="bg-yellow-500 text-black px-3 py-1 rounded mr-2"
                        onClick={() => setEditingAdmin(admin)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded"
                        onClick={() => deleteAdmin(admin.adminId)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Add New Admin */}
        {!editingAdmin && (
          <>
            <h3 className="text-xl text-blue-400 mb-4">Add New Admin</h3>
            <input
              type="text"
              placeholder="Username"
              className="w-full p-2 mb-3 rounded text-black"
              value={newAdmin.username}
              onChange={(e) => setNewAdmin((prev) => ({ ...prev, username: e.target.value }))}
            />
            <select
              className="w-full p-2 mb-3 rounded text-black"
              value={newAdmin.role}
              onChange={(e) => setNewAdmin((prev) => ({ ...prev, role: e.target.value }))}
            >
              <option value="Manager Admin">Manager Admin</option>
              <option value="Support Admin">Support Admin</option>
            </select>
            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 mb-3 rounded text-black"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin((prev) => ({ ...prev, password: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Admin Id"
              className="w-full p-2 mb-3 rounded text-black"
              value={newAdmin.adminId}
              onChange={(e) => setNewAdmin((prev) => ({ ...prev, adminId: e.target.value }))}
            />
            <button
              onClick={addAdmin}
              className="bg-green-500 text-white px-4 py-2 rounded w-full"
            >
              Add Admin
            </button>
          </>
        )}

        {/* Edit Admin */}
        {editingAdmin && (
          <>
            <h3 className="text-xl text-blue-400 mb-4">Edit Admin</h3>
            <input
              type="text"
              placeholder="Username"
              className="w-full p-2 mb-3 rounded text-black"
              value={editingAdmin.username}
              onChange={(e) =>
                setEditingAdmin((prev) => ({ ...prev, username: e.target.value }))
              }
            />
            <select
              className="w-full p-2 mb-3 rounded text-black"
              value={editingAdmin.role}
              onChange={(e) =>
                setEditingAdmin((prev) => ({ ...prev, role: e.target.value }))
              }
            >
              <option value="Manager Admin">Manager Admin</option>
              <option value="Support Admin">Support Admin</option>
            </select>
            <button
              onClick={updateAdmin}
              className="bg-green-500 text-white px-4 py-2 rounded w-full"
            >
              Update Admin
            </button>
            <button
              onClick={() => setEditingAdmin(null)}
              className="bg-gray-500 text-white px-4 py-2 rounded w-full mt-2"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageAdmins;
