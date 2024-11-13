import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useContext } from 'react'; 
import DashBoard from './common pages/goto-dashboard.jsx';
import Login from './common pages/Login.jsx';
import AdminDashboard from './admin pages/AdminDashboard.jsx';
import CreateElection from './admin pages/CreateElection.jsx';
import ManageElection from './admin pages/ManageElection.jsx';
import ManageSingleElection from './admin pages/ManageSingleElection.jsx'; 
import ViewResults from './admin pages/ViewResults.jsx';
import AdminHome from './admin pages/AdminHome.jsx';
import ManageAdmins from './admin pages/ManageAdmins.jsx'; // New page import
import RequestsForElection from './admin pages/RequestsForElection.jsx'; // New page import
import VoterDashboard from './voter pages/VoterDashboard.jsx';
import ElectionDetails from './voter pages/ElectionDetails.jsx';
import Home from './voter pages/VoterHome.jsx'
import VotingPage from './voter pages/VotingPage.jsx';
import VoterResultPage from './voter pages/VoterResultPage.jsx';
import AuthContext , { AuthProvider} from './context/AuthContext'; // Import AuthProvider and AuthContext
import './index.css';

const ProtectedRoute = ({ element, allowedRoles, redirectPath = "/admin-login" }) => {
  const { admin } = useContext(AuthContext); // Use `admin` instead of `user`
  return allowedRoles.includes(admin?.role) ? element : <Navigate to={redirectPath} />;
};


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
  element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={["Head Admin", "Manager Admin", "Support Admin"]} />}
>
  <Route index element={<Navigate to="home" />} />
  <Route path="home" element={<AdminHome />} />
  <Route path="create-election" element={<ProtectedRoute element={<CreateElection />} allowedRoles={["Head Admin", "Manager Admin"]} />} />
  <Route path="manage-election" element={<ProtectedRoute element={<ManageElection />} allowedRoles={["Head Admin", "Manager Admin"]} />} />
  <Route path="manage-election/:id" element={<ProtectedRoute element={<ManageSingleElection />} allowedRoles={["Head Admin", "Manager Admin"]} />} />
  <Route path="view-results" element={<ProtectedRoute element={<ViewResults />} allowedRoles={["Head Admin", "Manager Admin", "Support Admin"]} />} />
  {/* Restricted Routes - Visible only to Head Admin */}
  <Route path="manage-admins" element={<ProtectedRoute element={<ManageAdmins />} allowedRoles={["Head Admin"]} />} />
  <Route path="requests-for-election" element={<ProtectedRoute element={<RequestsForElection />} allowedRoles={["Head Admin"]} />} />
</Route>

          {/* Voter Dashboard Routes */}
          <Route path="/voter-dashboard" element={<VoterDashboard />}>
            <Route index element={<Navigate to="home" />} />
            <Route path="home" element={<Home />} />
            <Route path="election-details" element={<ElectionDetails />} />
          </Route>
          <Route path="/voting-page" element={<VotingPage />} />
          <Route path="/voter-result" element={<VoterResultPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);
root.render(<App />);

