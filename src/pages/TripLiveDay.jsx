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

export default function TripLiveDay() {
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
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

    // Get current day index from localStorage
    const { currentDayIndex } = getCurrentState();
    
    // Simple logic: if no stored day index or invalid, start at Day 1
    let dayIndex = 1;
    if (currentDayIndex && currentDayIndex >= 1 && currentDayIndex <= itineraryData.days.length) {
      dayIndex = currentDayIndex;
    }
    
    // Find the current day data
    const currentDayData = itineraryData.days.find(day => day.dayIndex === dayIndex);
    
    if (!currentDayData) {
      console.error("❌ Current day not found in itinerary");
      navigate("/");
      return;
    }

    // Set trip data
    setTripData({
      ...tripData,
      currentDay: dayIndex,
      totalDays: itineraryData.days.length,
      dayData: currentDayData
    });
    
    setLoading(false);
    console.log("✅ TripLiveDay loaded - Day", dayIndex);
  }, [navigate]);

  const handleStartDay = () => {
    // Get current block from localStorage
    const { currentBlockName } = getCurrentState();
    
    console.log("🔍 TripLiveDay handleStartDay - currentBlockName:", currentBlockName);
    console.log("🔍 TripLiveDay handleStartDay - tripData.currentDay:", tripData.currentDay);
    
    // If we're already on a specific block, continue from there
    if (currentBlockName && currentBlockName !== "morning") {
      console.log("✅ Continuing from current block:", currentBlockName);
      navigate("/tripliveblock");
    } else {
      // Start with morning block
      console.log("✅ Starting with morning block for day:", tripData.currentDay);
      setCurrentState(tripData.currentDay, "morning");
      navigate("/tripliveblock");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-xl font-semibold text-gray-700">Loading your day...</p>
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
            Day {tripData.currentDay} of {tripData.totalDays}
          </h1>
          <p className="text-xl text-gray-600">{tripData.tripName} • {tripData.city}</p>
        </div>

        {/* Day Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Today's Plan</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            {tripData.dayData.summary}
          </p>
          
          {/* Full Day Overview - All Blocks (Static) */}
          <div className="grid gap-4 md:grid-cols-3">
            {["morning", "afternoon", "evening"].map((timeOfDay) => {
              const block = tripData.dayData.blocks?.[timeOfDay];
              
              return (
                <div
                  key={timeOfDay}
                  className="rounded-xl p-4 border-2 border-gray-200 bg-gray-50 cursor-default"
                  style={{ pointerEvents: 'none' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm uppercase tracking-wide text-gray-500">
                      {timeOfDay}
                    </span>
                  </div>
                  
                  {block ? (
                    <div>
                      <h4 className="font-semibold text-sm mb-1 text-gray-600">
                        {block.title}
                      </h4>
                      {block.description && (
                        <p className="text-xs line-clamp-2 text-gray-500">
                          {block.description}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      No activity planned
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={handleStartDay}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-12 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 font-semibold text-xl"
          >
            {(() => {
              const { currentBlockName } = getCurrentState();
              if (currentBlockName === "morning") {
                return "🌅 Let's Start the Day!";
              } else if (currentBlockName === "afternoon") {
                return "☀️ Continue to Afternoon!";
              } else if (currentBlockName === "evening") {
                return "🌆 Continue to Evening!";
              } else {
                return "🚀 Continue Your Day!";
              }
            })()}
          </button>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/tripdaysoverview")}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Trip Overview
          </button>
        </div>
      </div>
    </div>
  );
}
