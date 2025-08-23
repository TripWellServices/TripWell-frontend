import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BACKEND_URL from "../config";

// Progressive navigation state management
const getCurrentState = () => {
  return {
    currentDayIndex: parseInt(localStorage.getItem("currentDayIndex") || "1"),
    currentBlockName: localStorage.getItem("currentBlockName") || "morning"
  };
};

// Safe defaults for fresh boot
const getDefaultState = () => {
  return {
    currentDayIndex: 1,
    currentBlockName: "morning",
    tripComplete: false
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

// 🔴 Hydration: Sync with backend authoritative state
const hydrateFromBackend = async (tripId) => {
  try {
    const res = await axios.get(`${BACKEND_URL}/tripwell/livestatus/${tripId}`);
    const { currentDayIndex, currentBlock, tripComplete } = res.data;
    
    // Overwrite local pointer with backend truth
    setCurrentState(currentDayIndex, currentBlock);
    
    return {
      currentDay: currentDayIndex,
      currentBlock,
      tripComplete,
      dayData: res.data.dayData
    };
  } catch (err) {
    console.warn("⚠️ Backend hydration failed, using local state:", err);
    return null; // Fall back to local state
  }
};

export default function TripLiveDay() {
  const [tripData, setTripData] = useState(null);
  const navigate = useNavigate();

  // Load trip data using progressive navigation state
  useEffect(() => {
    const tripData = JSON.parse(localStorage.getItem("tripData") || "null");
    const itineraryData = JSON.parse(localStorage.getItem("itineraryData") || "null");
    
    if (!tripData?.tripId || !itineraryData?.days) {
      console.error("❌ Missing trip data or itinerary data");
      navigate("/");
      return;
    }

    // 🟢 Step 1: Determine "Which day are we on?" - Progressive Navigation State
    const { currentDayIndex } = getCurrentState();
    
    console.log("🔍 TripLiveDay day calculation:", {
      currentDayIndex,
      today: new Date().toISOString()
    });
    
    // Use the current day from progressive navigation state
    let calculatedDayIndex = currentDayIndex;
    
    // Only reset to day 1 if we're starting fresh (no state exists)
    if (!currentDayIndex || currentDayIndex < 1) {
      calculatedDayIndex = 1;
      console.log("📅 Fresh start - Day 1");
    }
    
    // Find the current day from itinerary data
    const currentDayData = itineraryData.days.find(day => day.dayIndex === calculatedDayIndex);
    
    if (!currentDayData) {
      console.error("❌ Current day not found in itinerary");
      navigate("/");
      return;
    }

    // Check if trip is complete (past last day)
    const isTripComplete = calculatedDayIndex > itineraryData.days.length;

    // Use progressive navigation state (day only)
    const liveTripData = {
      ...tripData,
      currentDay: calculatedDayIndex,
      tripComplete: isTripComplete,
      totalDays: itineraryData.days.length,
      dayData: currentDayData // Real day data from itinerary
    };
    
    setTripData(liveTripData);
    console.log("💾 Loaded trip data with recalculated state:", liveTripData);
    
    // 🟡 Backend checkpoint happens on first "Complete Block" action
    // No backend call here - just local defaults
  }, [navigate]);

  const handleStartDay = () => {
    // Always start with morning block for the current day
    setCurrentState(tripData.currentDay, "morning");
    navigate("/tripliveblock");
  };

  const getBlockStatus = (blockName) => {
    // This would ideally come from backend hydration
    // For now, we'll show all blocks as available
    return "available"; // available, completed, current
  };

  if (!tripData) return (
    <div className="p-8 max-w-2xl mx-auto text-center">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="h-6 bg-gray-200 rounded mb-6"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-800">
          Day {tripData.currentDay} of {tripData.totalDays}
        </h1>
        <p className="text-lg text-gray-600">
          {tripData.city}
        </p>
        <div className="text-sm text-gray-500">
          {new Date(tripData.startDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Trip Progress</span>
          <span className="text-sm text-gray-500">{tripData.currentDay}/{tripData.totalDays || '?'}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(tripData.currentDay / (tripData.totalDays || 1)) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Day Summary */}
      {tripData.dayData?.summary && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">📋 Day Overview</h2>
          <p className="text-gray-600 leading-relaxed">
            {tripData.dayData.summary}
          </p>
        </div>
      )}

      {/* Start Day Button */}
      {!tripData.tripComplete && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ready to start your day?</h2>
          <p className="text-gray-600 mb-6">
            Let's begin with your morning activities in {tripData.city}!
          </p>
          <button
            onClick={handleStartDay}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-200 transform hover:scale-105"
          >
            🌅 Let's Start the Day!
          </button>
        </div>
      )}

      {/* Trip Complete Notice */}
      {tripData.tripComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-800 font-medium">🎉 Your trip is complete!</p>
          <button
            onClick={() => navigate("/tripcomplete")}
            className="mt-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm"
          >
            View Trip Summary
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate("/tripdaysoverview")}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg text-sm"
        >
          📋 View All Days
        </button>
        <button
          onClick={() => navigate("/")}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg text-sm"
        >
          🏠 Home
        </button>
      </div>
    </div>
  );
}
