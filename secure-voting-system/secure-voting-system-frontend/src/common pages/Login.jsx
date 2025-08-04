import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = ({ login }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [electionName, setElectionName] = useState('');
  const [voterId, setVoterId] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [voterData, setVoterData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { loginAdmin, loginVoter } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (login === 'Admin') {
      try {
        const response = await axios.post('http://localhost:5000/api/auth/admin-login', {
          username,
          password,
        });

        if (response.data.success) {
          loginAdmin(response.data.token, response.data.admin);
          navigate('/admin-dashboard');
        } else {
          setErrorMessage(response.data.message || 'Invalid credentials');
        }
      } catch (error) {
        setErrorMessage('Error connecting to server. Please try again.');
      }
    } else {
      // Voter login
      if (!electionName || !voterId || !password) {
        setErrorMessage('Please fill in all fields');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.post('http://localhost:5000/api/elections/voter-login', {
          electionName,
          voterId,
          password,
        });

        if (response.data.success) {
          if (response.data.requiresOTP) {
            setShowOTPInput(true);
            setVoterData(response.data.voter);
            setSuccessMessage('OTP sent to your email. Please check your email and enter the OTP.');
            setErrorMessage('');
          } else {
            loginVoter(response.data.voter);
            navigate('/voter-dashboard');
          }
        } else {
          setErrorMessage(response.data.message || 'Invalid voter credentials');
        }
        setTimeout(() => setErrorMessage(''), 5000);
        setTimeout(() => setSuccessMessage(''), 5000);
      } catch (error) {
        setErrorMessage('Error connecting to server. Please try again.');
      }
    }
    setIsLoading(false);
  };

  const handleOTPVerification = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    if (!otp) {
      setErrorMessage('Please enter the OTP');
      setIsLoading(false);
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
      setErrorMessage('Error connecting to server. Please try again.');
    }
    setIsLoading(false);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  const resetForm = () => {
    setShowOTPInput(false);
    setOtp('');
    setVoterData(null);
    setErrorMessage('');
    setSuccessMessage('');
  };

  if (showOTPInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl border border-white border-opacity-20 p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">OTP Verification</h2>
              <p className="text-blue-200">Enter the 6-digit code sent to your email</p>
            </div>

            {successMessage && (
              <div className="mb-6 p-4 bg-green-500 bg-opacity-20 border border-green-400 rounded-lg">
                <p className="text-green-300 text-sm">{successMessage}</p>
              </div>
            )}
            
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-400 rounded-lg">
                <p className="text-red-300 text-sm">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleOTPVerification} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-blue-200 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                  className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter 6-digit OTP"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="w-full bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300"
              >
                Back to Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl border border-white border-opacity-20 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              login === 'Admin' 
                ? 'bg-gradient-to-r from-green-400 to-blue-500' 
                : 'bg-gradient-to-r from-purple-400 to-pink-500'
            }`}>
              {login === 'Admin' ? (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {login === 'Admin' ? 'Admin Login' : 'Voter Login'}
            </h2>
            <p className="text-blue-200">
              {login === 'Admin' 
                ? 'Access the administrative dashboard' 
                : 'Cast your vote securely and anonymously'
              }
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-400 rounded-lg">
              <p className="text-red-300 text-sm">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {login === 'Admin' ? (
              <>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-blue-200 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your username"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-blue-200 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your password"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="electionName" className="block text-sm font-medium text-blue-200 mb-2">
                    Election Name
                  </label>
                  <input
                    type="text"
                    id="electionName"
                    value={electionName}
                    onChange={(e) => setElectionName(e.target.value)}
                    className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter election name"
                  />
                </div>

                <div>
                  <label htmlFor="voterId" className="block text-sm font-medium text-blue-200 mb-2">
                    Voter ID
                  </label>
                  <input
                    type="text"
                    id="voterId"
                    value={voterId}
                    onChange={(e) => setVoterId(e.target.value)}
                    className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your voter ID"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-blue-200 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your password"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-xl font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                login === 'Admin'
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 focus:ring-green-500'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 focus:ring-purple-500'
              }`}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300"
            >
              Back to Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
