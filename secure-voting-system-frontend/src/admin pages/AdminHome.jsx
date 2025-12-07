import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function AdminHome() {
  const { admin } = useContext(AuthContext);
  return (
    <div className="p-6 space-y-8 min-h-screen bg-slate-900 text-slate-200">

      {/* Header Section */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to the Admin Portal</h1>
          <p className="text-slate-400 text-lg">Manage elections, monitor results, and oversee the democratic process with precision and security.</p>
        </div>
      </div>

      {/* Process Flow Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { step: 1, title: 'Create Election', desc: 'Define details & upload lists', color: 'from-cyan-500 to-blue-500' },
          { step: 2, title: 'Manage & Monitor', desc: 'Oversee ongoing elections', color: 'from-blue-500 to-indigo-500' },
          { step: 3, title: 'Voter Participation', desc: 'Secure blockchain voting', color: 'from-indigo-500 to-purple-500' },
          { step: 4, title: 'Publish Results', desc: 'Instant & immutable results', color: 'from-purple-500 to-pink-500' }
        ].map((item, index) => (
          <div key={index} className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300`}></div>
            <div className="relative bg-slate-800 border border-slate-700 p-6 rounded-xl hover:border-slate-600 transition-all h-full">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-bold mb-4 shadow-lg`}>
                {item.step}
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
              <p className="text-sm text-slate-400">{item.desc}</p>
            </div>
            {index < 3 && (
              <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-20 text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* How-To Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Guide */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-white/5">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="w-2 h-8 bg-cyan-500 rounded-full mr-4"></span>
              How to Create an Election
            </h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-cyan-400 font-bold">1</div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Navigate to Creation Page</h3>
                  <p className="text-slate-400 text-sm">Click on "Create Election" in the sidebar menu. (Visible to Head & Manager Admins)</p>
                </div>
              </div>

              <div className="prose prose-invert bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                <h4 className="text-slate-200 text-sm font-bold uppercase tracking-wider mb-2">Process Checklist</h4>
                <ul className="list-disc list-inside text-slate-400 text-sm space-y-1">
                  <li>Enter Election Name & Description</li>
                  <li>Set Start & End Date/Time</li>
                  <li>Upload <strong>Voters List (.xlsx)</strong> - <em>Auto-generates credentials</em></li>
                  <li>Upload <strong>Candidates List (.xlsx)</strong> - <em>Defines ballot options</em></li>
                </ul>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-cyan-400 font-bold">2</div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Verification Details</h3>
                  <p className="text-slate-400 text-sm">Review uploaded files carefully. The system will automatically create specific lists for this election.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-cyan-400 font-bold">3</div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Approval & Launch</h3>
                  <p className="text-slate-400 text-sm">
                    If you are a Manager Admin, your election will go to <strong>Requests</strong> for approval.<br />
                    Once approved (or if created by Head Admin), notification emails are sent automatically to all voters.
                  </p>
                  {admin?.role === 'Manager Admin' && (
                    <Link to="/admin-dashboard/my-requests" className="inline-block mt-2 text-xs text-cyan-400 hover:text-cyan-300 font-bold underline">
                      Check Request Status →
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex gap-4">
              <Link to="/admin-dashboard/create-election" className="inline-flex items-center px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors text-sm font-medium">
                Create New Election
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </Link>
              <Link to="/admin-dashboard/manage-election" className="inline-flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium">
                Manage Elections
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Roles Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-white/5 h-full">
            <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-4">Admin Roles & Permissions</h3>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-700/30 border border-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-purple-400">Head Admin</h4>
                  <span className="px-2 py-0.5 rounded text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20">Super User</span>
                </div>
                <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                  <li>Approve/Reject Admin Signups</li>
                  <li>Approve/Reject Election Requests</li>
                  <li>Manage All Admins</li>
                  <li>Full System Control</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-700/30 border border-blue-500/20">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-blue-400">Manager Admin</h4>
                  <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20">Operational</span>
                </div>
                <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                  <li>Create Elections</li>
                  <li>Manage Own Elections</li>
                  <li>View Results</li>
                </ul>
              </div>


            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminHome;


