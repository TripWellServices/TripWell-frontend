import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../firebase";
import BACKEND_URL from "../config";

export default function ModifyBlockPlanner() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tripData, setTripData] = useState(null);
  const [itineraryData, setItineraryData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedBlock, setSelectedBlock] = useState("morning");
  const [feedback, setFeedback] = useState("");
  const [modifying, setModifying] = useState(false);

  useEffect(() => {
    // Load trip and itinerary data
    const loadData = () => {
      const tripData = JSON.parse(localStorage.getItem("tripData") || "null");
      const itineraryData = JSON.parse(localStorage.getItem("itineraryData") || "null");
      
      setTripData(tripData);
      setItineraryData(itineraryData);
    };

    loadData();
  }, []);

  const handleModifyBlock = async () => {
    if (!feedback.trim()) {
      alert("Please provide feedback for the modification");
      return;
    }

    setModifying(true);
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();
      
      const response = await axios.post(
        `${BACKEND_URL}/tripwell/planner/modify-block`,
        {
          tripId: tripData.tripId,
          dayIndex: selectedDay,
          block: selectedBlock,
          feedback: feedback.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success) {
        // Update local storage with modified itinerary
        const updatedItinerary = response.data.updatedItinerary;
        localStorage.setItem("itineraryData", JSON.stringify(updatedItinerary));
        setItineraryData(updatedItinerary);
        
        setFeedback("");
        alert("Block modified successfully!");
      }
    } catch (error) {
      console.error("Modify block error:", error);
      alert("Failed to modify block. Please try again.");
    } finally {
      setModifying(false);
    }
  };

  if (!tripData || !itineraryData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trip data...</p>
        </div>
      </div>
    );
  }

  const currentBlock = itineraryData.parsedDays?.[selectedDay - 1]?.blocks?.[selectedBlock];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Modify Itinerary Block</h1>
            <button
              onClick={() => navigate("/pretriphub")}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back to Trip Hub
            </button>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
            <h2 className="text-xl font-semibold text-blue-600 mb-2">{tripData.tripName}</h2>
            <p className="text-gray-600">📍 {tripData.city} • {tripData.daysTotal} days</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Block Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Select Block to Modify</h3>
            
            {/* Day Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: tripData.daysTotal }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Day {i + 1}</option>
                ))}
              </select>
            </div>

            {/* Block Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Block</label>
              <select
                value={selectedBlock}
                onChange={(e) => setSelectedBlock(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>

            {/* Current Block Display */}
            {currentBlock && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Current Activity:</h4>
                <p className="text-gray-600">{currentBlock.activity}</p>
                <div className="mt-2 flex gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {currentBlock.type}
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    {currentBlock.persona}
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                    {currentBlock.budget}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Modification Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Modification Request</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What would you like to change?
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="e.g., Make this more adventurous, add a restaurant, change to a museum..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <button
              onClick={handleModifyBlock}
              disabled={modifying || !feedback.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {modifying ? "Modifying..." : "Modify Block"}
            </button>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This will modify your planned itinerary. 
                Changes will be reflected in your trip plan but won't affect your live trip experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
