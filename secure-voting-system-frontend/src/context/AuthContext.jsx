import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [voter, setVoter] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to save admin info after login
  const loginAdmin = (adminData, token) => {
    const { username, role, id } = adminData;
    const adminDetails = { username, role, id }; // Store necessary details
    setAdmin(adminDetails);
    localStorage.setItem("secureVoting_admin", JSON.stringify(adminDetails));
    if (token) {
      localStorage.setItem("secureVoting_adminToken", token);
    }
  };

  // Function to save voter info after login
  const loginVoter = (voterData, token) => {
    const { voterId, voterName, address, age, electionDetails } = voterData;
    const voterDetails = {
      voterId,
      voterName,
      role: "Voter",
      address,
      age,
      eligibility: "Eligible to Vote",
      electionDetails,
    };
    setVoter(voterDetails);
    localStorage.setItem("secureVoting_voter", JSON.stringify(voterDetails));
    if (token) {
      localStorage.setItem("secureVoting_voterToken", token);
    }
  };

  // Logout admin
  const logoutAdmin = () => {
    setAdmin(null);
    localStorage.removeItem("secureVoting_admin");
    localStorage.removeItem("secureVoting_adminToken");
  };

  // Logout voter
  const logoutVoter = () => {
    setVoter(null);
    localStorage.removeItem("secureVoting_voter");
    localStorage.removeItem("secureVoting_voterToken");
  };

  // Retrieve from local storage if refreshed
  useEffect(() => {
    try {
      const storedAdmin = JSON.parse(localStorage.getItem("secureVoting_admin"));
      const storedVoter = JSON.parse(localStorage.getItem("secureVoting_voter"));
      if (storedAdmin) setAdmin(storedAdmin);
      if (storedVoter) setVoter(storedVoter);
    } catch (error) {
      console.error("Error parsing stored data:", error);
      localStorage.removeItem("secureVoting_admin");
      localStorage.removeItem("secureVoting_voter");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        admin,
        voter,
        loading,
        loginAdmin,
        loginVoter,
        logoutAdmin,
        logoutVoter,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;

