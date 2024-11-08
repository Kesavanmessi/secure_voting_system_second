function Home() {
  // Mock data for election and voter details
  const electionDetails = {
    name: 'Presidential Election 2024',
    description: 'This election is for the President of the United States.',
  };

  const voterDetails = {
    name: 'John Doe',
    eligibility: 'Eligible to vote',
    voterID: 'VTR12345678',
  };

  return (
    <div className="bg-gray-800 p-5 rounded-lg shadow-lg w-full max-w-lg">
      {/* Election Information */}
      <h2 className="text-2xl mb-4">Election Name: {electionDetails.name}</h2>
      <p className="mb-4">{electionDetails.description}</p>

      {/* Voter Information */}
      <div className="bg-gray-700 p-4 rounded-md">
        <h3 className="text-xl mb-2">Voter Information</h3>
        <p><strong>Name:</strong> {voterDetails.name}</p>
        <p><strong>Voter ID:</strong> {voterDetails.voterID}</p>
        <p><strong>Eligibility:</strong> {voterDetails.eligibility}</p>
      </div>
    </div>
  );
}

export default Home;
