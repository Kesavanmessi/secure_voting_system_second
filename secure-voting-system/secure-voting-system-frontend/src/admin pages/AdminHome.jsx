function AdminHome() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-10">
      <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg p-10">
        {/* Welcome Section */}
        <h1 className="text-5xl text-blue-400 mb-5 text-center font-bold">Welcome to the Admin Portal</h1>
        <p className="text-xl text-gray-300 text-center mb-10">
          This portal allows admins to manage elections, voters, and results with ease. Follow the instructions below to make the most of the system.
        </p>

        {/* Explanation Sections */}
        <div className="space-y-10">
          {/* Create Election Section */}
          <div>
            <h2 className="text-3xl text-green-400 font-bold mb-3">1. Creating an Election</h2>
            <p className="text-lg text-gray-300 mb-4">
              To create an election, follow these steps:
            </p>
            <ul className="list-decimal list-inside text-lg text-gray-300">
              <li>Navigate to the "Create Election" page from the dashboard.</li>
              <li>Fill in the required details, such as the election name, start and end times, and descriptions.</li>
              <li>Add voter lists and candidate lists to the election. You can select existing lists or create new ones.</li>
              <li>Ensure all details are accurate before submitting the form to create the election.</li>
            </ul>
            <p className="text-lg text-gray-300 mt-4">
              Once created, the election will appear in the "Manage Elections" section where you can further modify or monitor it.
            </p>
          </div>

          {/* Manage Elections Section */}
          <div>
            <h2 className="text-3xl text-yellow-400 font-bold mb-3">2. Managing Elections</h2>
            <p className="text-lg text-gray-300 mb-4">
              After creating an election, admins can manage it from the "Manage Elections" section:
            </p>
            <ul className="list-disc list-inside text-lg text-gray-300">
              <li>Update election details like start and end times or associated voter and candidate lists.</li>
              <li>Delete elections (if not yet started) to remove invalid or unnecessary entries.</li>
              <li>Monitor ongoing elections to ensure everything runs smoothly.</li>
            </ul>
          </div>

          {/* Result Management Section */}
          <div>
            <h2 className="text-3xl text-purple-400 font-bold mb-3">3. Viewing and Publishing Results</h2>
            <p className="text-lg text-gray-300 mb-4">
              Once an election ends, results can be viewed and published:
            </p>
            <ul className="list-disc list-inside text-lg text-gray-300">
              <li>Go to the "View Results" section to access finished elections.</li>
              <li>View vote counts and identify the winner of the election.</li>
              <li>Click "Publish Results" to make the election results visible to voters.</li>
            </ul>
            <p className="text-lg text-gray-300 mt-4">
              Published results can also be moved to the "Finished Elections" section for archival purposes.
            </p>
          </div>

          {/* Roles and Access Section */}
          <div>
            <h2 className="text-3xl text-red-400 font-bold mb-3">4. Roles and Access</h2>
            <p className="text-lg text-gray-300 mb-4">
              The system defines three types of admin roles:
            </p>
            <ul className="list-disc list-inside text-lg text-gray-300">
              <li>
                <strong>Head Admin:</strong> Has complete access, including managing other admins and reviewing modification requests.
              </li>
              <li>
                <strong>Manager Admin:</strong> Can create elections, manage elections, and view results.
              </li>
              <li>
                <strong>Support Admin:</strong> Can only view election results and assist with voter inquiries.
              </li>
            </ul>
          </div>

          {/* System Highlights */}
          <div>
            <h2 className="text-3xl text-cyan-400 font-bold mb-3">5. System Highlights</h2>
            <p className="text-lg text-gray-300 mb-4">
              The secure voting system ensures:
            </p>
            <ul className="list-disc list-inside text-lg text-gray-300">
              <li>Data accuracy with real-time updates.</li>
              <li>Role-based access to maintain security and transparency.</li>
              <li>End-to-end encryption for vote counts and election data.</li>
              <li>Intuitive interfaces for both admins and voters.</li>
            </ul>
            <p className="text-lg text-gray-300 mt-4">
              If you need assistance, please contact the support team or refer to the admin documentation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminHome;
