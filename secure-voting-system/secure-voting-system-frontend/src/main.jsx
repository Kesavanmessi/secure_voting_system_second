import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState } from 'react'; 
import DashBoard from './common pages/goto-dashboard.jsx';
import Login from './common pages/Login.jsx';
import AdminDashboard from './admin pages/AdminDashboard.jsx';
import CreateElection from './admin pages/CreateElection.jsx';
import ManageElection from './admin pages/ManageElection.jsx';
import ManageSingleElection from './admin pages/ManageSingleElection.jsx'; 
import ViewResults from './admin pages/ViewResults.jsx';
import AdminHome from './admin pages/AdminHome.jsx';
import VoterDashboard from './voter pages/VoterDashboard.jsx';
import ElectionDetails from './voter pages/ElectionDetails.jsx';
import Home from './voter pages/VoterHome.jsx'
import VotingPage from './voter pages/VotingPage.jsx';
import VoterResultPage from './voter pages/VoterResultPage.jsx';
import './index.css';

const App = () => {
  const [elections, setElections] = useState([
    {
      id: 1,
      name: 'Presidential Election 2024',
      candidates: ['Alice Johnson', 'Bob Smith'],
      voters: ['John Doe', 'Jane Doe'],
      startTime: '2024-01-01T09:00',
      endTime: '2024-01-01T17:00'
    },
    {
      id: 2,
      name: 'Local City Council Election',
      candidates: ['Tom Brown', 'Sara White'],
      voters: ['Emily Clark', 'Mike Johnson'],
      startTime: '2024-05-15T09:00',
      endTime: '2024-05-15T17:00'
    },
    {
      id: 3,
      name: 'School Board Election',
      candidates: ['Laura Green', 'Mark Blue'],
      voters: ['Alice Brown', 'Charlie Black'],
      startTime: '2024-09-01T09:00',
      endTime: '2024-09-01T17:00'
    }
  ]);

  const updateElection = (updatedElection) => {
    setElections(prevElections =>
      prevElections.map(election =>
        election.id === updatedElection.id ? updatedElection : election
      )
    );
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashBoard />} />
        <Route path="/admin-login" element={<Login login="Admin" />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />}>
          <Route index element={<Navigate to="home" />} />
          <Route path="home" element={<AdminHome />} />
          <Route path="create-election" element={<CreateElection />} />
          <Route path="manage-election" element={<ManageElection />} />
          <Route path="manage-election/:id" element={
            <ManageSingleElection elections={elections} updateElection={updateElection} />
          } />
          <Route path="view-results" element={<ViewResults />} />
        </Route>
        <Route path="/voter-login" element={<Login login="Voter" />} />
        <Route path="/voter-dashboard" element={<VoterDashboard />}>
        <Route index element={<Navigate to="home" />} />
        <Route path="home" element={<Home />} />
        <Route path="election-details" element={<ElectionDetails />} />
      </Route>
      <Route path="/voting-page" element={<VotingPage/>} />
      <Route path="/voter-result" element={<VoterResultPage/>} />
      </Routes>
    </Router>
  );
};

createRoot(document.getElementById('root')).render(<App />);
