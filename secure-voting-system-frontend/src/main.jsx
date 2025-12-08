import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext, { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import AuthInterceptor from './components/AuthInterceptor';

// Common Pages
import LandingPage from './common pages/LandingPage.jsx';
import Login from './common pages/Login.jsx';

// Admin Pages
import AdminDashboard from './admin pages/AdminDashboard.jsx';
import CreateElection from './admin pages/CreateElection.jsx';
import ManageElection from './admin pages/ManageElection.jsx';
import ManageSingleElection from './admin pages/ManageSingleElection.jsx';
import ViewResults from './admin pages/ViewResults.jsx';
import AdminHome from './admin pages/AdminHome.jsx';
import ManageAdmins from './admin pages/ManageAdmins.jsx';
import RequestsForElection from './admin pages/RequestsForElection.jsx';
import ManageAdminRequests from './admin pages/ManageAdminRequests.jsx';
import MyElectionRequests from './admin pages/MyElectionRequests.jsx';

// Voter Pages
import VoterDashboard from './voter pages/VoterDashboard.jsx';
import ElectionDetails from './voter pages/ElectionDetails.jsx';
import Home from './voter pages/VoterHome.jsx';
import VotingPage from './voter pages/VotingPage.jsx';
import VoterResultPage from './voter pages/VoterResultPage.jsx';
import CastVote from './voter pages/CastVote.jsx';
import VoterViewResults from './voter pages/VoterViewResults.jsx';

// Styles
import './index.css';

// ProtectedRoute Component
const ProtectedRoute = ({ element, allowedRoles, redirectPath = '/' }) => {
  const { admin, voter, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (admin && allowedRoles.includes(admin.role)) {
    return <>{element}</>;
  }
  if (voter && allowedRoles.includes('Voter')) {
    return <>{element}</>;
  }
  return <Navigate to={redirectPath} />;
};

// Main App Component
const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AuthInterceptor />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/admin-login" element={<Login login="Admin" />} />
            <Route path="/voter-login" element={<Login login="Voter" />} />

            {/* Admin Dashboard Routes */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute
                  element={<AdminDashboard />}
                  allowedRoles={['Head Admin', 'Manager Admin']}
                />
              }
            >
              <Route index element={<Navigate to="home" />} />
              <Route path="home" element={<AdminHome />} />
              <Route
                path="create-election"
                element={
                  <ProtectedRoute
                    element={<CreateElection />}
                    allowedRoles={['Head Admin', 'Manager Admin']}
                  />
                }
              />
              <Route
                path="manage-election"
                element={
                  <ProtectedRoute
                    element={<ManageElection />}
                    allowedRoles={['Head Admin', 'Manager Admin']}
                  />
                }
              />
              <Route
                path="manage-election/:id"
                element={
                  <ProtectedRoute
                    element={<ManageSingleElection />}
                    allowedRoles={['Head Admin', 'Manager Admin']}
                  />
                }
              />
              <Route
                path="view-results"
                element={
                  <ProtectedRoute
                    element={<ViewResults />}
                    allowedRoles={['Head Admin', 'Manager Admin']}
                  />
                }
              />
              <Route
                path="manage-admins"
                element={<ProtectedRoute element={<ManageAdmins />} allowedRoles={['Head Admin']} />}
              />
              <Route
                path="requests-for-election"
                element={
                  <ProtectedRoute element={<RequestsForElection />} allowedRoles={['Head Admin']} />
                }
              />
              <Route
                path="my-requests"
                element={
                  <ProtectedRoute element={<MyElectionRequests />} allowedRoles={['Manager Admin']} />
                }
              />
              <Route
                path="admin-requests"
                element={
                  <ProtectedRoute element={<ManageAdminRequests />} allowedRoles={['Head Admin']} />
                }
              />
            </Route>

            {/* Voter Dashboard Routes */}
            <Route
              path="/voter-dashboard"
              element={<ProtectedRoute element={<VoterDashboard />} allowedRoles={['Voter']} />}
            >
              <Route index element={<Navigate to="home" />} />
              <Route path="home" element={<Home />} />
              <Route path="election-details" element={<ElectionDetails />} />
            </Route>
            <Route
              path="/voting-page"
              element={<ProtectedRoute element={<VotingPage />} allowedRoles={['Voter']} />}
            />
            <Route
              path="/voter-result"
              element={<ProtectedRoute element={<VoterResultPage />} allowedRoles={['Voter']} />}
            />
            <Route
              path="/cast-vote"
              element={<ProtectedRoute element={<CastVote />} allowedRoles={['Voter']} />}
            />
            <Route
              path="/voter-results"
              element={<ProtectedRoute element={<VoterViewResults />} allowedRoles={['Voter']} />}
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

// Mount the App
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);
root.render(<App />);
