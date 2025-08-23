import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Progressive navigation state management
const setCurrentState = (dayIndex, blockName) => {
  localStorage.setItem("currentDayIndex", dayIndex.toString());
  localStorage.setItem("currentBlockName", blockName);
};

export default function PickLiveDay() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tripData, setTripData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    function loadTripData() {
      try {
        // Get itinerary data from localStorage
        const itineraryData = localStorage.getItem("itineraryData");
        const localTripData = localStorage.getItem("tripData");
        
        if (!itineraryData) {
          setError("No itinerary data found.");
          setLoading(false);
          return;
        }

        if (!localTripData) {
          setError("No trip data found.");
          setLoading(false);
          return;
        }

        const parsedItinerary = JSON.parse(itineraryData);
        const parsedTripData = JSON.parse(localTripData);
        const days = parsedItinerary.days || [];
        
        if (days.length === 0) {
          setError("No days found in itinerary.");
          setLoading(false);
          return;
        }

        setDays(days);
        setTripData(parsedTripData);
      } catch (err) {
        console.error("Failed to load trip data from localStorage:", err);
        setError("Could not load trip data.");
      } finally {
        setLoading(false);
      }
    }

    loadTripData();
  }, []);

  const handlePickDay = (dayIndex) => {
    // Set state to start at morning of the selected day
    setCurrentState(dayIndex, "morning");
    console.log("✅ Picked Day", dayIndex, "morning");
    navigate("/tripliveday");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading your trip days...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-4xl">⚠️</div>
          <h2 className="text-xl font-semibold text-red-700">{error}</h2>
          <button 
            onClick={() => navigate("/livedayreturner")}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-800">Pick a Day</h1>
          <p className="text-lg text-gray-600">
            Which day would you like to start from?
          </p>
          
          {/* Trip Info */}
          {tripData && (
            <div className="bg-white rounded-2xl p-6 shadow-lg max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-blue-600 mb-2">{tripData.tripName}</h2>
              <p className="text-gray-600 mb-2">📍 {tripData.city}</p>
              <p className="text-gray-600">
                📅 {new Date(tripData.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - {new Date(tripData.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>

        {/* Days Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {days.map((day) => (
            <div
              key={day.dayIndex}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Day Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
                <h3 className="text-2xl font-bold">Day {day.dayIndex}</h3>
                {day.summary && (
                  <p className="text-green-100 mt-2 text-sm">{day.summary}</p>
                )}
              </div>

              {/* Day Content */}
              <div className="p-6 space-y-4">
                {/* Time Blocks Preview */}
                {["morning", "afternoon", "evening"].map((timeOfDay) => {
                  const block = day.blocks?.[timeOfDay];
                  return block ? (
                    <div key={timeOfDay} className="border-l-4 border-green-200 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-green-600 uppercase tracking-wide">
                          {timeOfDay}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">{block.title}</h4>
                      {block.description && (
                        <p className="text-gray-600 text-xs mb-2 line-clamp-2">{block.description}</p>
                      )}
                    </div>
                  ) : (
                    <div key={timeOfDay} className="border-l-4 border-gray-200 pl-4">
                      <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                        {timeOfDay}
                      </span>
                      <p className="text-gray-400 text-xs mt-1">No activity planned</p>
                    </div>
                  );
                })}

                {/* Start This Day Button */}
                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handlePickDay(day.dayIndex)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 font-semibold"
                  >
                    🚀 Start Day {day.dayIndex}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <div className="flex justify-center pt-8">
          <button
            onClick={() => navigate("/livedayreturner")}
            className="bg-gray-100 text-gray-700 px-8 py-3 rounded-2xl hover:bg-gray-200 transition-all duration-200 font-semibold"
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
