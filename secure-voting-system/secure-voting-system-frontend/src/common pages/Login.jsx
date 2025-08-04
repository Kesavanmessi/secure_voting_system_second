import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext'; // Import AuthContext

function Login({ login }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVoter, setIsVoter] = useState(true);
  const [electionName, setElectionName] = useState('');
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [voterData, setVoterData] = useState(null);
  const { loginAdmin, loginVoter } = useContext(AuthContext); // Access loginAdmin from AuthContext

  const navigate = useNavigate();

  useEffect(() => {
    setIsVoter(login === 'Voter');
  }, [login]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password || (isVoter && !electionName)) {
      setErrorMessage('All fields are required');
      return;
    }

    try {
      if (login === 'Admin') {
        const response = await axios.post('http://localhost:5000/api/elections/admin-login', { username, password });
        if (response.data.success) {
          loginAdmin(response.data.admin); // Save admin data
          navigate('/admin-dashboard');
        } else {
          setErrorMessage('Invalid admin credentials');
        }
      } else if (login === 'Voter') {
        const response = await axios.post('http://localhost:5000/api/elections/voter-login', {
          electionName,
          voterId: username,
          password,
        });
        
        if (response.data.success) {
          if (response.data.requiresOTP) {
            // Show OTP input
            setShowOTPInput(true);
            setVoterData(response.data.voter);
            setSuccessMessage('OTP sent to your email. Please check your email and enter the OTP.');
            setErrorMessage('');
          } else {
            // Direct login (fallback)
            loginVoter(response.data.voter);
            navigate('/voter-dashboard');
          }
        } else {
          setErrorMessage(response.data.message || 'Invalid voter credentials');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Login failed. Please try again.');
    }

    setTimeout(() => setErrorMessage(''), 5000);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleOTPVerification = async (e) => {
    e.preventDefault();

    if (!otp) {
      setErrorMessage('Please enter the OTP');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/elections/voter-verify-otp', {
        electionId: voterData.electionDetails.electionId,
        voterId: voterData.voterId,
        otp: otp,
      });

      if (response.data.success) {
        loginVoter(response.data.voter);
        navigate('/voter-dashboard');
      } else {
        setErrorMessage(response.data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setErrorMessage('OTP verification failed. Please try again.');
    }

    setTimeout(() => setErrorMessage(''), 5000);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const resetForm = () => {
    setShowOTPInput(false);
    setOtp('');
    setVoterData(null);
    setSuccessMessage('');
    setErrorMessage('');
  };

  if (showOTPInput) {
    return (
      <div className="flex flex-col bg-black justify-center items-center min-h-screen">
        <div className="border-2 border-blue-500 p-10 rounded-lg">
          <h1 className="text-3xl text-white mb-7 text-green-500">OTP Verification</h1>

          {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
          {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

          <form onSubmit={handleOTPVerification}>
            <label htmlFor="otp" className="text-blue-400">Enter OTP:</label>
            <br />
            <input
              type="text"
              className="pl-2 mt-2 focus:outline-none text-xl w-full"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
            />
            <br />

            <button
              type="submit"
              className="mt-4 p-2 bg-blue-500 text-white rounded-lg w-full"
            >
              Verify OTP
            </button>
            
            <button
              type="button"
              onClick={resetForm}
              className="mt-2 p-2 bg-gray-500 text-white rounded-lg w-full"
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    );
  }

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
