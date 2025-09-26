import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../firebase";
import BACKEND_URL from "../config";

export default function ModifyBlockExecution() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tripData, setTripData] = useState(null);
  const [liveTripData, setLiveTripData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedBlock, setSelectedBlock] = useState("morning");
  const [feedback, setFeedback] = useState("");
  const [modifying, setModifying] = useState(false);

  useEffect(() => {
    // Load trip and live trip data
    const loadData = () => {
      const tripData = JSON.parse(localStorage.getItem("tripData") || "null");
      const liveTripData = JSON.parse(localStorage.getItem("liveTripData") || "null");
      
      setTripData(tripData);
      setLiveTripData(liveTripData);
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
        `${BACKEND_URL}/tripwell/execution/modify-block`,
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
        // Update local storage with modified live trip data
        const updatedLiveTrip = response.data.updatedLiveTrip;
        localStorage.setItem("liveTripData", JSON.stringify(updatedLiveTrip));
        setLiveTripData(updatedLiveTrip);
        
        setFeedback("");
        alert("Block modified successfully!");
      }
    } catch (error) {
      console.error("Modify live block error:", error);
      alert("Failed to modify block. Please try again.");
    } finally {
      setModifying(false);
    }
  };

  if (!tripData || !liveTripData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading live trip data...</p>
        </div>
      </div>
    );
  }

  const currentBlock = liveTripData.days?.[selectedDay - 1]?.blocks?.[selectedBlock];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Modify Live Trip Block</h1>
            <button
              onClick={() => navigate("/livedayreturner")}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back to Live Trip
            </button>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
            <h2 className="text-xl font-semibold text-green-600 mb-2">{tripData.tripName}</h2>
            <p className="text-gray-600">📍 {tripData.city} • Day {liveTripData.currentDay} of {liveTripData.totalDays}</p>
            <p className="text-sm text-gray-500">🚀 Live Trip in Progress</p>
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {Array.from({ length: liveTripData.totalDays }, (_, i) => (
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                
                {/* Show if block is completed */}
                {liveTripData.days?.[selectedDay - 1]?.isComplete && (
                  <div className="mt-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      ✅ Completed
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modification Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Live Modification Request</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What would you like to change right now?
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="e.g., This restaurant is closed, I want something closer, make it more spontaneous..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            <button
              onClick={handleModifyBlock}
              disabled={modifying || !feedback.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {modifying ? "Modifying..." : "Modify Live Block"}
            </button>

            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Live Trip Mode:</strong> This will modify your current live trip experience. 
                Changes are immediate and will affect your ongoing trip.
              </p>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Live modifications are perfect for real-time adjustments 
                like restaurant closures, weather changes, or spontaneous decisions!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
