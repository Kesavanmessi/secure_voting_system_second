import { NavLink, Outlet } from 'react-router-dom';

function VoterDashboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-10">
      <h1 className="text-4xl mb-10 text-green-500">Voter Dashboard</h1>

      <nav className="mb-10 flex gap-4">
        <NavLink
          to="/voter-dashboard/home"
          className={({ isActive }) => 
            `px-4 py-2 rounded ${isActive ? 'bg-blue-500' : 'bg-blue-700'}`
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/voter-dashboard/election-details"
          className={({ isActive }) => 
            `px-4 py-2 rounded ${isActive ? 'bg-blue-500' : 'bg-blue-700'}`
          }
        >
          Election Details
        </NavLink>
      </nav>

      {/* Outlet for nested routes */}
      <Outlet />
    </div>
  );
}

export default VoterDashboard;
