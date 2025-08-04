import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PublicView = () => {
  const [electionName, setElectionName] = useState('');
  const [voterId, setVoterId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [electionData, setElectionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handlePublicViewAccess = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (!electionName || !voterId || !email || !password) {
      setErrorMessage('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/elections/public-view-otp', {
        electionName,
        voterId,
        email,
        password
      });

      if (response.data.success) {
        setShowOTPInput(true);
        setSuccessMessage('OTP sent to your email. Please check your email and enter the OTP.');
      } else {
        setErrorMessage(response.data.message || 'Invalid credentials');
      }
    } catch (error) {
      setErrorMessage('Error connecting to server. Please try again.');
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
      const response = await axios.post('http://localhost:5000/api/elections/public-view', {
        electionName,
        voterId,
        email,
        password,
        otp
      });

      if (response.data.success) {
        setElectionData(response.data);
        setSuccessMessage('Public view access granted!');
      } else {
        setErrorMessage(response.data.message || 'Invalid OTP');
      }
    } catch (error) {
      setErrorMessage('Error connecting to server. Please try again.');
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setShowOTPInput(false);
    setOtp('');
    setElectionData(null);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const calculatePercentage = (votes, totalVotes) => {
    if (totalVotes === 0) return 0;
    return ((votes / totalVotes) * 100).toFixed(1);
  };

  if (electionData) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Live Election Results</h1>
              <button
                onClick={resetForm}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                New Search
              </button>
            </div>

            {/* Election Details */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-2">{electionData.election.electionName}</h2>
              <p className="text-gray-600 mb-2">{electionData.election.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Start Time:</span> {formatDate(electionData.election.startTime)}
                </div>
                <div>
                  <span className="font-semibold">End Time:</span> {formatDate(electionData.election.endTime)}
                </div>
                <div>
                  <span className="font-semibold">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    electionData.election.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {electionData.election.isActive ? 'Active' : 'Ended'}
                  </span>
                </div>
              </div>
            </div>

            {/* Voter Information */}
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Voter Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><span className="font-semibold">Voter ID:</span> {electionData.voter.voterId}</div>
                <div><span className="font-semibold">Name:</span> {electionData.voter.voterName}</div>
                <div><span className="font-semibold">Email:</span> {electionData.voter.email}</div>
              </div>
              <div className="mt-2">
                <span className="font-semibold">Voting Status:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  electionData.hasVoted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {electionData.hasVoted ? 'Vote Cast' : 'Not Voted Yet'}
                </span>
              </div>
            </div>

            {/* Live Results */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Live Election Results</h3>
              <div className="mb-4">
                <span className="font-semibold">Total Votes Cast:</span> {electionData.totalVotes}
              </div>
              
              <div className="space-y-4">
                {electionData.candidates.map((candidate, index) => (
                  <div key={candidate.candidateId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-lg">{candidate.candidateId}</h4>
                      <span className="text-lg font-bold text-blue-600">{candidate.voteCount} votes</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${calculatePercentage(candidate.voteCount, electionData.totalVotes)}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {calculatePercentage(candidate.voteCount, electionData.totalVotes)}% of total votes
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Last Updated */}
            <div className="text-center text-sm text-gray-500 mt-6">
              Last updated: {formatDate(electionData.currentTime)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showOTPInput) {
    return (
      <div className="flex flex-col bg-black justify-center items-center min-h-screen">
        <div className="border-2 border-blue-500 p-10 rounded-lg">
          <h1 className="text-3xl text-white mb-7 text-green-500">Public View OTP Verification</h1>
          {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
          {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
          <form onSubmit={handleOTPVerification}>
            <label htmlFor="otp" className="text-blue-400">Enter OTP:</label>
            <br />
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
              className="w-full p-2 mb-4 border border-gray-300 rounded text-black"
              placeholder="Enter 6-digit OTP"
            />
            <br />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600 mt-2"
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
        <h1 className="text-3xl text-white mb-7 text-green-500">Public View Access</h1>
        <p className="text-blue-400 mb-6 text-center">
          Enter your credentials to view live election details
        </p>
        
        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
        {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
        
        <form onSubmit={handlePublicViewAccess}>
          <label htmlFor="electionName" className="text-blue-400">Election Name:</label>
          <br />
          <input
            type="text"
            id="electionName"
            value={electionName}
            onChange={(e) => setElectionName(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 rounded text-black"
            placeholder="Enter election name"
          />
          <br />
          
          <label htmlFor="voterId" className="text-blue-400">Voter ID:</label>
          <br />
          <input
            type="text"
            id="voterId"
            value={voterId}
            onChange={(e) => setVoterId(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 rounded text-black"
            placeholder="Enter your voter ID"
          />
          <br />
          
          <label htmlFor="email" className="text-blue-400">Email:</label>
          <br />
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 rounded text-black"
            placeholder="Enter your email"
          />
          <br />
          
          <label htmlFor="password" className="text-blue-400">Password:</label>
          <br />
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 rounded text-black"
            placeholder="Enter your password"
          />
          <br />
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Get OTP'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600 mt-2"
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default PublicView; 