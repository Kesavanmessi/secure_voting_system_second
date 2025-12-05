import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';

function VoterDashboard() {
  const { logoutVoter, voter } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutVoter();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-cyan-500/30">
      <div className="flex h-screen overflow-hidden">

        {/* Sidebar Navigation */}
        <motion.aside
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-64 bg-slate-800/50 backdrop-blur-xl border-r border-white/5 flex flex-col hidden md:flex"
        >
          <div className="p-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              SecureVote
            </h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Voter Portal</p>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            <NavLink
              to="/voter-dashboard/home"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                  ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-white border border-emerald-500/20 shadow-lg shadow-emerald-500/10'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              <span className="font-medium">Dashboard</span>
            </NavLink>

            <NavLink
              to="/voter-dashboard/election-details"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                  ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-white border border-emerald-500/20 shadow-lg shadow-emerald-500/10'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <span className="font-medium">Details</span>
            </NavLink>
          </nav>

          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                {voter?.voterName?.charAt(0) || 'V'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{voter?.voterName || 'Voter'}</p>
                <p className="text-xs text-slate-500 truncate">{voter?.voterId}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              <span>Logout</span>
            </button>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-slate-900 relative">
          {/* Background Elements */}
          <div className="absolute top-0 left-0 w-full h-96 bg-brand-gradient opacity-5 blur-3xl pointer-events-none"></div>

          <div className="p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}

export default VoterDashboard;
