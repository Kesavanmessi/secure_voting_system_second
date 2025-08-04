import { NavLink, Outlet } from 'react-router-dom';
import { useContext } from 'react'; // Assuming role is stored in a global context or state
import AuthContext from '../context/AuthContext.jsx'; // Importing the context where you store the user role

function AdminDashboard() {
  const { admin } = useContext(AuthContext); // Get the admin's role from context

  return (
    <div className="flex flex-col bg-gray-900 min-h-screen text-white">
      {/* Heading */}
      <header className="text-center py-5 border-b-2 border-green-500">
        <h1 className="text-4xl font-bold text-green-400">Admin Dashboard</h1>
      </header>
      <header className="text-center py-5 border-b-2 border-green-500">
        <h1 className="text-4xl font-bold text-green-400">Welcome, {admin?.username}</h1>
        <p className="text-xl text-gray-400">Role: {admin?.role}</p>
      </header>
      {/* Navbar */}
      <nav className="flex justify-center space-x-10 bg-gray-800 py-5">
        <NavLink 
          to="home" 
          className={({ isActive }) => 
            isActive ? "text-2xl text-yellow-400" : "text-2xl text-blue-300 hover:text-blue-500"
          }>
          Home
        </NavLink>
        <NavLink 
          to="create-election" 
          className={({ isActive }) => 
            isActive ? "text-2xl text-yellow-400" : "text-2xl text-blue-300 hover:text-blue-500"
          }>
          Create Election
        </NavLink>
        <NavLink 
          to="manage-election" 
          className={({ isActive }) => 
            isActive ? "text-2xl text-yellow-400" : "text-2xl text-blue-300 hover:text-blue-500"
          }>
          Manage Election
        </NavLink>
        <NavLink 
          to="view-results" 
          className={({ isActive }) => 
            isActive ? "text-2xl text-yellow-400" : "text-2xl text-blue-300 hover:text-blue-500"
          }>
          View Results
        </NavLink>

        {/* Conditionally render links only visible to Head Admin */}
        {admin.role === 'Head Admin' && (
          <>
            <NavLink 
              to="manage-admins" 
              className={({ isActive }) => 
                isActive ? "text-2xl text-yellow-400" : "text-2xl text-blue-300 hover:text-blue-500"
              }>
              Manage Admins
            </NavLink>
            <NavLink 
              to="requests-for-election" 
              className={({ isActive }) => 
                isActive ? "text-2xl text-yellow-400" : "text-2xl text-blue-300 hover:text-blue-500"
              }>
              Election Requests
            </NavLink>
            <NavLink 
              to="adding-lists" 
              className={({ isActive }) => 
                isActive ? "text-2xl text-yellow-400" : "text-2xl text-blue-300 hover:text-blue-500"
              }>
              Manage Lists
            </NavLink>
          </>
        )}
      </nav>

      {/* Outlet for nested routes */}
      <Outlet />
    </div>
  );
}

export default AdminDashboard;
