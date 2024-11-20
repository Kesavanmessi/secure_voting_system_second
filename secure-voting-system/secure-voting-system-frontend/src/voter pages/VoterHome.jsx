import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';

function Home() {
  const { voter } = useContext(AuthContext);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
     
    
    const interval = setInterval(() => {
      const currentTime = new Date();
      const startTime = new Date(voter?.electionDetails?.startTime);
      const endTime = new Date(voter?.electionDetails?.endTime);
      if (currentTime < startTime) {
        const diff = startTime - currentTime;
        setTimeLeft(`Election starts in: ${formatTime(diff)}`);
      } else if (currentTime >= startTime && currentTime <= endTime) {
        setTimeLeft("Election is ongoing");
      } else {
        setTimeLeft("Election has ended");
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
