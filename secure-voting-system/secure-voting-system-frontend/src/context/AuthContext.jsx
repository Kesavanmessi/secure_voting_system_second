import { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [voter, setVoter] = useState(null);

  // Function to save admin info after login
  const loginAdmin = (adminData) => {
    const { username, role, id } = adminData;
    const adminDetails = { username, role, id }; // Store necessary details
    setAdmin(adminDetails);
    localStorage.setItem("secureVoting_admin", JSON.stringify(adminDetails));
  };

  // Function to save voter info after login
  const loginVoter = (voterData) => {
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
  };

  // Logout admin
  const logoutAdmin = () => {
    setAdmin(null);
    localStorage.removeItem("secureVoting_admin");
  };

  // Logout voter
  const logoutVoter = () => {
    setVoter(null);
    localStorage.removeItem("secureVoting_voter");
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
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        admin,
        voter,
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

export default AuthContext;

