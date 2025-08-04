import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';

function Home() {
  const { voter } = useContext(AuthContext);
  const [timeLeft, setTimeLeft] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date();
      const startTime = new Date(voter?.electionDetails?.startTime);
      const adjustedStartTime = new Date(startTime.getTime() + 1 * 60 * 1000); // Add 1 minute
      const endTime = new Date(voter?.electionDetails?.endTime);

      if (currentTime < adjustedStartTime) {
        const diff = adjustedStartTime - currentTime;
        setMessage("Election starts in:");
        setTimeLeft(formatTime(diff));
      } else if (currentTime >= adjustedStartTime && currentTime <= endTime) {
        const diff = endTime - currentTime;
        setMessage("Election ends in:");
        setTimeLeft(formatTime(diff));
      } else {
        setMessage("Election has ended.");
        setTimeLeft(""); // No countdown after the election ends
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [voter]);

  const formatTime = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    const hours = Math.floor((ms / 1000 / 60 / 60) % 24);
    const days = Math.floor(ms / 1000 / 60 / 60 / 24);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="bg-gray-800 p-5 rounded-lg shadow-lg w-full max-w-lg">
      {/* Election Information */}
      <h2 className="text-2xl mb-4 text-green-400">
        Election Name: {voter?.electionDetails?.electionName || 'N/A'}
      </h2>
      <p className="text-yellow-300">{message}</p>
      <p className="text-yellow-300">{timeLeft}</p>

      {/* Voter Information */}
      <div className="bg-gray-700 p-4 rounded-md">
        <h3 className="text-xl mb-2 text-blue-300">Voter Information</h3>
        <p><strong>Name:</strong> {voter?.voterName || 'N/A'}</p>
        <p><strong>Voter ID:</strong> {voter?.voterId || 'N/A'}</p>
        <p><strong>Address:</strong> {voter?.address || 'N/A'}</p>
        <p><strong>Age:</strong> {voter?.age || 'N/A'}</p>
        <p><strong>Eligibility:</strong> {voter?.eligibility || 'N/A'}</p>
      </div>
    </div>
  );
}

export default Home;
