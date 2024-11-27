import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext, { AuthProvider } from './context/AuthContext';

// Common Pages
import DashBoard from './common pages/goto-dashboard.jsx';
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

// Voter Pages
import VoterDashboard from './voter pages/VoterDashboard.jsx';
import ElectionDetails from './voter pages/ElectionDetails.jsx';
import Home from './voter pages/VoterHome.jsx';
import VotingPage from './voter pages/VotingPage.jsx';
import VoterResultPage from './voter pages/VoterResultPage.jsx';

// Styles
import './index.css';

// ProtectedRoute Component
const ProtectedRoute = ({ element, allowedRoles, redirectPath = '/' }) => {
  const { admin, voter } = useContext(AuthContext);

  // If the user is logged in as an admin, check admin roles
  if (admin) {
    return allowedRoles.includes(admin?.role)
      ? element
      : <Navigate to={redirectPath || '/admin-login'} />;
  }

  // If the user is logged in as a voter, allow voter access
  if (voter) {
    return allowedRoles.includes('Voter')
      ? element
      : <Navigate to={redirectPath || '/voter-login'} />;
  }

  // If no user is logged in, redirect to home
  return <Navigate to="/" />;
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<DashBoard />} />
          <Route path="/admin-login" element={<Login login="Admin" />} />
          <Route path="/voter-login" element={<Login login="Voter" />} />

          {/* Admin Dashboard Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute
                element={<AdminDashboard />}
                allowedRoles={['Head Admin', 'Manager Admin', 'Support Admin']}
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
                  allowedRoles={['Head Admin', 'Manager Admin', 'Support Admin']}
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
        </Routes>
      </Router>
    </AuthProvider>
  );
};

// Mount the App
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);
root.render(<App />);
