function AdminHome() {
    return (
      <div className="flex flex-col items-center text-center p-10 bg-gray-700 rounded-lg shadow-lg mt-5">
        <h2 className="text-3xl text-blue-400 mb-5">Admin Home</h2>
        <p className="text-xl text-gray-200 mb-5">
          Here you can manage your elections and voters.
        </p>
        <ul className="list-disc text-lg text-gray-200 text-left">
          <li className="mb-3">To create an election, go to the "Create Election" section and fill out the required details.</li>
          <li>To manage voters, navigate to "Manage Voters" and you will have options to add, edit, or delete voters.</li>
        </ul>
      </div>
    );
  }
  
  export default AdminHome;
  