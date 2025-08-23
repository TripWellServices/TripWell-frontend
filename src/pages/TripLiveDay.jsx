import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Utility functions for managing current day
const getCurrentDay = () => {
  return parseInt(localStorage.getItem("currentDayIndex") || "1");
};

const setCurrentDay = (dayIndex) => {
  localStorage.setItem("currentDayIndex", dayIndex.toString());
};

export default function TripLiveDay() {
  const [tripData, setTripData] = useState(null);
  const navigate = useNavigate();

  // Load trip data from localStorage (no backend call needed)
  useEffect(() => {
    const tripData = JSON.parse(localStorage.getItem("tripData") || "null");
    const itineraryData = JSON.parse(localStorage.getItem("itineraryData") || "null");
    const currentDayIndex = localStorage.getItem("currentDayIndex");
    
    if (!tripData?.tripId || !itineraryData?.days) {
      console.error("❌ Missing trip data or itinerary data");
      navigate("/");
      return;
    }

    // Find the current day from itinerary data
    const currentDay = parseInt(currentDayIndex) || 1;
    const currentDayData = itineraryData.days.find(day => day.dayIndex === currentDay);
    
    if (!currentDayData) {
      console.error("❌ Current day not found in itinerary");
      navigate("/");
      return;
    }

    // Use real data structure
    const liveTripData = {
      ...tripData,
      currentDay: currentDay,
      currentBlock: "morning", // Default to morning
      tripComplete: false,
      totalDays: itineraryData.days.length,
      dayData: currentDayData // Real day data from itinerary
    };
    
    setTripData(liveTripData);
    console.log("💾 Loaded trip data from localStorage:", liveTripData);
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

        {tripData.currentBlock !== 'done' && (
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
