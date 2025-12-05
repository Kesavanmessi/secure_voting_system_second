import { useState, useEffect } from "react";
import axios from "axios";

function ManageLists() {
  const [voterLists, setVoterLists] = useState([]);
  const [candidateLists, setCandidateLists] = useState([]);
  const [activeTab, setActiveTab] = useState("voter"); // voter or candidate
  const [selectedList, setSelectedList] = useState(null);
  const [newListName, setNewListName] = useState("");
  const [newItems, setNewItems] = useState([]);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success"); // success or error
  const [file, setFile] = useState(null);

  const handleUploadList = async () => {
    if (!newListName || !file) {
      showMessage("List name and file are required.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("listname", newListName);
    formData.append("file", file);

    const endpoint = activeTab === "voter" ? "voters" : "candidates";

    try {
      await axios.post(`http://localhost:5000/api/upload/${endpoint}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      showMessage(`${activeTab === "voter" ? "Voter" : "Candidate"} list uploaded successfully.`, "success");
      fetchLists();
      setNewListName("");
      setFile(null);
      // Reset file input if possible, or just rely on state
      document.querySelector('input[type="file"]').value = '';
    } catch (error) {
      console.error("Error uploading list:", error);
      showMessage(error.response?.data?.message || "Error uploading list.", "error");
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/elections/all");
      setVoterLists(response.data.voterLists || []);
      setCandidateLists(response.data.candidateLists || []);
      console.log(voterLists);
    } catch (error) {
      console.error("Error fetching lists:", error);
      showMessage("Error fetching lists.", "error");
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCreateList = async () => {
    if (!newListName || newItems.length < 2) {
      showMessage("List name and at least 2 items are required.", "error");
      return;
    }

    const endpoint = activeTab === "voter" ? "voters/create" : "candidates/create";
    const itemsKey = activeTab === "voter" ? "voters" : "candidates";

    try {
      await axios.post(`http://localhost:5000/api/elections/${endpoint}`, {
        listname: newListName,
        [itemsKey]: newItems,
      });
      showMessage(`${activeTab === "voter" ? "Voter" : "Candidate"} list created successfully.", "success"`);
      fetchLists();
      setNewListName("");
      setNewItems([]);
    } catch (error) {
      console.error("Error creating list:", error);
      showMessage("Error creating list. Please try again.", "error");
    }
  };

  const handleUpdateList = async () => {
    if (!selectedList || selectedList.items.length < 2) {
      showMessage("At least 2 items are required in the list.", "error");
      return;
    }

    const endpoint = activeTab === "voter" ? "voters/update" : "candidates/update";

    try {
      await axios.put(`http://localhost:5000/api/elections/${endpoint}/${selectedList._id}`, {
        listname: selectedList.listname,
        items: selectedList.items,
      });
      showMessage(`${activeTab === "voter" ? "Voter" : "Candidate"} list updated successfully.", "success"`);
      fetchLists();
      setSelectedList(null);
    } catch (error) {
      console.error("Error updating list:", error);
      showMessage("Error updating list. Please try again.", "error");
    }
  };

  const handleDeleteList = async (listId) => {
    const endpoint = activeTab === "voter" ? "voters/delete" : "candidates/delete";
    try {
      await axios.delete(`http://localhost:5000/api/elections/${endpoint}/${listId}`);
      showMessage(`${activeTab === "voter" ? "Voter" : "Candidate"} list deleted successfully.", "success"`);
      fetchLists();
    } catch (error) {
      console.error("Error deleting list:", error);
      showMessage("Error deleting list. Please try again.", "error");
    }
  };

  const handleAddItem = () => {
    const newItem =
      activeTab === "voter"
        ? { voterId: "", voterName: "", age: "", address: "", password: "" }
        : { candidateId: "", candidateName: "", party: "" };
    if (selectedList) {
      setSelectedList((prev) => ({ ...prev, items: [...(prev?.items || []), newItem] }));
    } else {
      setNewItems((prev) => [...prev, newItem]);
    }
  };

  const handleDeleteItem = (index) => {
    setSelectedList((prev) => {
      const updatedItems = [...prev.items];
      updatedItems.splice(index, 1);
      return { ...prev, items: updatedItems };
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10 flex flex-col items-center">
      <h1 className="text-4xl text-green-500 mb-5">Manage Lists</h1>
      {message && (
        <div className={`mb-4 p-4 rounded ${messageType === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-5 flex gap-5">
        <button
          className={`p-2 rounded-lg ${activeTab === "voter" ? "bg-blue-500" : "bg-gray-700"}`}
          onClick={() => setActiveTab("voter")}
        >
          Voter Lists
        </button>
        <button
          className={`p-2 rounded-lg ${activeTab === "candidate" ? "bg-blue-500" : "bg-gray-700"}`}
          onClick={() => setActiveTab("candidate")}
        >
          Candidate Lists
        </button>
      </div>

      {/* Display Lists */}
      {(activeTab === "voter" ? voterLists : candidateLists).map((list) => (
        <div key={list._id} className="bg-gray-800 p-4 rounded-lg mb-4">
          <h3 className="text-xl text-green-500">{list.listname
          }</h3>
          <button
            className="bg-yellow-500 p-2 rounded text-white mt-2"
            onClick={() => setSelectedList(list)}
          >
            Update List
          </button>
          <button
            className="bg-red-500 p-2 rounded text-white mt-2"
            onClick={() => handleDeleteList(list._id)}
          >
            Delete List
          </button>
        </div>
      ))}

      {/* Create or Update List Form */}
      <div className="w-full max-w-4xl mt-10">
        <h2 className="text-2xl text-blue-400 mb-4">
          {selectedList ? `Update ${activeTab === "voter" ? "Voter" : "Candidate"} List` : `Create New ${activeTab === "voter" ? "Voter" : "Candidate"} List`}
        </h2>
        <input
          type="text"
          placeholder="List Name"
          className="w-full p-2 mb-4 rounded-lg text-black"
          value={selectedList ? selectedList.listname : newListName}
          onChange={(e) =>
            selectedList
              ? setSelectedList((prev) => ({ ...prev, listname: e.target.value }))
              : setNewListName(e.target.value)
          }
        />

        {(selectedList ? selectedList.items : newItems).map((item, index) => (
          <div key={index} className="flex gap-4 mb-2">
            <input
              type="text"
              placeholder={activeTab === "voter" ? "Voter ID" : "Candidate ID"}
              className="p-2 rounded-lg flex-1 text-black"
              value={item[activeTab === "voter" ? "voterId" : "candidateId"]}
              onChange={(e) => {
                const key = activeTab === "voter" ? "voterId" : "candidateId";
                const updatedItems = [...(selectedList ? selectedList.items : newItems)];
                updatedItems[index][key] = e.target.value;
                selectedList
                  ? setSelectedList((prev) => ({ ...prev, items: updatedItems }))
                  : setNewItems(updatedItems);
              }}
            />
            <button
              className="bg-red-500 text-white p-2 rounded-lg"
              onClick={() => handleDeleteItem(index)}
            >
              Delete
            </button>
          </div>
        ))}

        <button
          className="bg-blue-500 p-2 rounded-lg w-full mt-4"
          onClick={handleAddItem}
        >
          Add Item
        </button>

        <button
          className="bg-green-500 p-2 rounded-lg w-full mt-4"
          onClick={selectedList ? handleUpdateList : handleCreateList}
        >
          {selectedList ? "Save Changes" : "Create List"}
        </button>

        {!selectedList && (
          <div className="mt-10 border-t border-gray-700 pt-6">
            <h3 className="text-xl text-yellow-500 mb-4">OR Upload from Excel</h3>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="List Name for Upload"
                className="w-full p-2 rounded-lg text-black"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
              <input
                type="file"
                accept=".xlsx, .xls"
                className="w-full p-2 rounded-lg bg-gray-700 text-white"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <button
                className="bg-purple-500 p-2 rounded-lg w-full"
                onClick={handleUploadList}
              >
                Upload Excel
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {activeTab === "candidate"
                ? "Excel must contain 'candidateId' and 'candidateName' columns. Other columns are optional."
                : "Excel must contain 'voterId', 'voterName', 'email', 'address', 'age'. 'password' is optional."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageLists;
