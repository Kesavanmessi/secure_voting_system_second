import { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState({});

  // Function to save admin info after login
  const loginAdmin = (adminData) => {
    const { username, role, id } = adminData;
    const adminDetails = { username, role, id }; // Store only necessary details
    setAdmin(adminDetails);
    localStorage.setItem("admin", JSON.stringify(adminDetails)); 
  };

  // Retrieve from local storage if refreshed
  useEffect(() => {
    const storedAdmin = JSON.parse(localStorage.getItem("admin"));
    if (storedAdmin) setAdmin(storedAdmin);
  }, []);

  return (
    <AuthContext.Provider value={{ admin, loginAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
