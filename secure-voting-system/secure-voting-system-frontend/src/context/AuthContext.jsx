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
    localStorage.setItem("admin", JSON.stringify(adminDetails));
  };

  // Function to save voter info after login
  const loginVoter = (voterData) => {
    const { voterId, voterName, address, age, electionDetails } = voterData;
    const voterDetails = {
      voterId,
      voterName,
      address,
      age,
      eligibility: "Eligible to Vote",
      electionDetails,
    };
    setVoter(voterDetails);
    localStorage.setItem("voter", JSON.stringify(voterDetails));
  };
  
  // Logout admin
  const logoutAdmin = () => {
    setAdmin(null);
    localStorage.removeItem("admin");
  };

  // Logout voter
  const logoutVoter = () => {
    setVoter(null);
    localStorage.removeItem("voter");
  };

  // Retrieve from local storage if refreshed
  useEffect(() => {
    const storedAdmin = JSON.parse(localStorage.getItem("admin"));
    const storedVoter = JSON.parse(localStorage.getItem("voter"));
    if (storedAdmin) setAdmin(storedAdmin);
    if (storedVoter) setVoter(storedVoter);
  }, []);

  return (
    <AuthContext.Provider value={{ admin, voter, loginAdmin, loginVoter, logoutAdmin, logoutVoter }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
