import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login({ login }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVoter, setIsVoter] = useState(true);
  const [electionName, setElectionName] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    setIsVoter(login === 'Voter');
  }, [login]);

  // Function to handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setErrorMessage('Username and password are required');
      return;
    }

    try {
      let response;

      if (login === 'Admin') {
        // 1. Admin Login: Check if admin credentials match in the database
        response = await axios.post('http://localhost:5000/api/elections/admin-login', { username, password });
        if (response.data.success) {
          navigate('/admin-dashboard');
        } else {
          setErrorMessage('Invalid admin credentials');
        }

      } else if (login === 'Voter') {
        // 2. Voter Login: Verify election and voter details
        response = await axios.post('http://localhost:5000/api/elections/voter-login', { electionName, voterId: username, password });
        
        if (response.data.success) {
          navigate('/voter-dashboard');
        } else {
          setErrorMessage(response.data.message || 'Invalid voter credentials');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Login failed. Please try again.');
    }

    // Clear error message after 5 seconds
    setTimeout(() => setErrorMessage(''), 3000);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="flex flex-col bg-black justify-center items-center min-h-screen">
      <div className="border-2 border-blue-500 p-10 rounded-lg">
        <h1 className="text-5xl text-white mb-7 text-green-500">{login} Login</h1>

        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

        <form onSubmit={handleLogin}>
          {isVoter && (
            <>
              <label htmlFor="electionName" className="text-blue-400">Election Name:</label>
              <br />
              <input
                type="text"
                className="pl-2 mt-2 focus:outline-none text-xl w-full"
                placeholder="Election Name"
                value={electionName}
                onChange={(e) => setElectionName(e.target.value)}
              />
              <br />
            </>
          )}

          <label htmlFor="username" className="text-blue-400">
            {isVoter ? "Voter ID" : "Username"}:
          </label>
          <br />
          <input
            type="text"
            className="pl-2 mt-2 focus:outline-none text-xl w-full"
            placeholder={isVoter ? "Voter ID" : "Username"}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <br />

          <label htmlFor="password" className="text-blue-400">Password:</label>
          <br />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="pl-2 mt-2 focus:outline-none text-xl w-full"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-2 top-2 text-gray-600"
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>

          <button
            type="submit"
            className="mt-4 p-2 bg-blue-500 text-white rounded-lg w-full"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
