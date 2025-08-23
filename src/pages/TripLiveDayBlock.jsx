import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Simple state management
const getCurrentState = () => {
  return {
    currentDayIndex: parseInt(localStorage.getItem("currentDayIndex") || "1"),
    currentBlockName: localStorage.getItem("currentBlockName") || "morning"
  };
};

const setCurrentState = (dayIndex, blockName) => {
  localStorage.setItem("currentDayIndex", dayIndex.toString());
  localStorage.setItem("currentBlockName", blockName);
};

const advanceBlock = () => {
  const { currentDayIndex, currentBlockName } = getCurrentState();
  
  if (currentBlockName === "morning") {
    setCurrentState(currentDayIndex, "afternoon");
  } else if (currentBlockName === "afternoon") {
    setCurrentState(currentDayIndex, "evening");
  } else if (currentBlockName === "evening") {
    // Move to next day, reset to morning
    setCurrentState(currentDayIndex + 1, "morning");
  }
};

export default function TripLiveDayBlock() {
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load trip data from localStorage
    const tripData = JSON.parse(localStorage.getItem("tripData") || "null");
    const itineraryData = JSON.parse(localStorage.getItem("itineraryData") || "null");
    
    if (!tripData?.tripId || !itineraryData?.days) {
      console.error("❌ Missing trip data or itinerary data");
      navigate("/");
      return;
    }

    // Get current state
    const { currentDayIndex, currentBlockName } = getCurrentState();
    
    // Find the current day data
    const currentDayData = itineraryData.days.find(day => day.dayIndex === currentDayIndex);
    
    if (!currentDayData) {
      console.error("❌ Current day not found in itinerary");
      navigate("/");
      return;
    }

    // Get the current block data
    const currentBlockData = currentDayData.blocks[currentBlockName];
    
    if (!currentBlockData) {
      console.error("❌ Current block not found");
      navigate("/");
      return;
    }

    // Set trip data
    setTripData({
      ...tripData,
      currentDay: currentDayIndex,
      currentBlock: currentBlockName,
      totalDays: itineraryData.days.length,
      dayData: currentDayData,
      blockData: currentBlockData
    });
    
    setLoading(false);
    console.log("✅ TripLiveDayBlock loaded - Day", currentDayIndex, currentBlockName);
  }, [navigate]);

  const handleCompleteBlock = async () => {
    setSaving(true);
    
    try {
      // Advance the progressive navigation pointer
      advanceBlock();
      
      // Check if we're at the end of the day (evening complete)
      const isEndOfDay = tripData.currentBlock === "evening";
      const isEndOfTrip = tripData.currentDay >= tripData.totalDays;

      // Navigate based on state
      if (isEndOfDay) {
        navigate("/tripdaylookback"); // Day complete, do reflection
      } else if (isEndOfTrip) {
        navigate("/tripcomplete"); // Trip complete
      } else {
        navigate("/tripliveday"); // Back to live day view
      }
    } catch (error) {
      console.error("❌ Error completing block:", error);
      setSaving(false);
    }
  };

  const getBlockTitle = (blockName) => {
    const titles = {
      morning: "🌅 Morning",
      afternoon: "☀️ Afternoon", 
      evening: "🌙 Evening"
    };
    return titles[blockName] || blockName;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-xl font-semibold text-gray-700">Loading your activity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {getBlockTitle(tripData.currentBlock)}
          </h1>
          <p className="text-xl text-gray-600">
            Day {tripData.currentDay} of {tripData.totalDays} • {tripData.tripName}
          </p>
        </div>

        {/* Activity Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Activity</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            {tripData.blockData.title}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <button
            onClick={handleCompleteBlock}
            disabled={saving}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-12 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 font-semibold text-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Completing...
              </span>
            ) : (
              "✅ Complete Activity"
            )}
          </button>

          <button
            onClick={() => navigate("/tripliveday")}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Day Overview
          </button>
        </div>
      </div>
    </div>
  );
}
