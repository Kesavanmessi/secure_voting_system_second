import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';

function AdminDashboard() {
  const { admin, logoutAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: 'home', roles: ['Head Admin', 'Manager Admin', 'Support Admin'] },
    { name: 'Create Election', path: 'create-election', roles: ['Head Admin', 'Manager Admin'] },
    { name: 'Manage Elections', path: 'manage-election', roles: ['Head Admin', 'Manager Admin'] },
    { name: 'View Results', path: 'view-results', roles: ['Head Admin', 'Manager Admin', 'Support Admin'] },
    { name: 'Manage Admins', path: 'manage-admins', roles: ['Head Admin'] },
    { name: 'Admin Requests', path: 'admin-requests', roles: ['Head Admin'] },
    { name: 'Election Requests', path: 'requests-for-election', roles: ['Head Admin'] },
    { name: 'My Requests', path: 'my-requests', roles: ['Manager Admin'] }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-200">

      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/5 shadow-lg">
        <div className="w-full px-6">
          <div className="flex justify-between items-center h-20">

            {/* Logo / Brand */}
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-cyan-500/30">
                A
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Admin<span className="text-cyan-400">Portal</span></h1>
                <p className="text-xs text-slate-400 font-medium">{admin?.role}</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden xl:flex items-center space-x-1">
              {navLinks.map((link) => {
                if (!link.roles.includes(admin?.role)) return null;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                        ? 'bg-cyan-500/10 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)] border border-cyan-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    {link.name}
                  </NavLink>
                );
              })}
            </div>

            {/* User Profile & Logout */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-800/50 border border-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                  {admin?.username?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-300 pr-2">{admin?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="xl:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-400 hover:text-white p-2"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="xl:hidden border-t border-white/5 bg-slate-900"
            >
              <div className="px-4 pt-2 pb-6 space-y-1">
                {navLinks.map((link) => {
                  if (!link.roles.includes(admin?.role)) return null;
                  return (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={({ isActive }) =>
                        `block px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`
                      }
                    >
                      {link.name}
                    </NavLink>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-4 py-3 rounded-lg text-base font-medium text-red-400 hover:bg-red-500/10 transition-colors mt-4"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
}

export default AdminDashboard;
