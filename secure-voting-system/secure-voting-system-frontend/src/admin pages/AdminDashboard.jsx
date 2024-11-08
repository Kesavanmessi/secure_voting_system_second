import { NavLink, Outlet} from 'react-router-dom';

function AdminDashboard() {
  return (
    <div className="flex flex-col bg-gray-900 min-h-screen text-white">
      {/* Heading */}
      <header className="text-center py-5 border-b-2 border-green-500">
        <h1 className="text-4xl font-bold text-green-400">Admin Dashboard</h1>
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
      </nav>

      {/* Redirect to Home by default when accessing /admin-dashboard */}
      <Outlet />
    </div>
  );
}

export default AdminDashboard;
