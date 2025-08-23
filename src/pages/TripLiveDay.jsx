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

    // 🟢 Recalculate current day based on trip dates (handles refresh)
    const today = new Date();
    const startDate = new Date(tripData.startDate);
    const endDate = new Date(tripData.endDate);
    
    let calculatedDayIndex = 1; // Default to day 1
    
    console.log("🔍 TripLiveDay date calculation:", {
      today: today.toISOString(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    
    if (today >= startDate && today <= endDate) {
      // We're within the trip dates
      const diffTime = today.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      calculatedDayIndex = diffDays + 1; // +1 because day 1 is the first day
      console.log("📅 Within trip dates - Day", calculatedDayIndex);
    } else if (today < startDate) {
      // Trip hasn't started yet
      calculatedDayIndex = 1;
      console.log("📅 Trip hasn't started - Day 1");
    } else {
      // Trip is over
      calculatedDayIndex = itineraryData.days.length;
      console.log("📅 Trip is over - Day", calculatedDayIndex);
    }
    
    // Update localStorage with calculated day
    setCurrentState(calculatedDayIndex, "morning");
    
    // Find the current day from itinerary data
    const currentDayData = itineraryData.days.find(day => day.dayIndex === calculatedDayIndex);
    
    if (!currentDayData) {
      console.error("❌ Current day not found in itinerary");
      navigate("/");
      return;
    }

    // Check if trip is complete (past last day)
    const isTripComplete = calculatedDayIndex > itineraryData.days.length;

    // Use recalculated progressive navigation state
    const liveTripData = {
      ...tripData,
      currentDay: calculatedDayIndex,
      currentBlock: "morning", // Always reset to morning on refresh
      tripComplete: isTripComplete,
      totalDays: itineraryData.days.length,
      dayData: currentDayData // Real day data from itinerary
    };
    
    setTripData(liveTripData);
    console.log("💾 Loaded trip data with recalculated state:", liveTripData);
    
    // 🟡 Backend checkpoint happens on first "Complete Block" action
    // No backend call here - just local defaults
  }, [navigate]);

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

      {/* Current Block Info */}
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          {tripData.currentBlock === 'morning' && '🌅 Morning'}
          {tripData.currentBlock === 'afternoon' && '☀️ Afternoon'}
          {tripData.currentBlock === 'evening' && '🌙 Evening'}
          {tripData.currentBlock === 'done' && '✅ Day Complete'}
        </h2>
        
        {tripData.dayData?.summary && (
          <p className="text-gray-600 mb-4">
            {tripData.dayData.summary}
          </p>
        )}

                 {!tripData.tripComplete && (
           <button
             onClick={() => navigate("/tripliveblock")}
             className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg text-lg transition-colors"
           >
             Start {tripData.currentBlock.charAt(0).toUpperCase() + tripData.currentBlock.slice(1)}
           </button>
         )}
      </div>

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
