import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TripDaysOverview() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    function fetchDays() {
      try {
        // Get itinerary data from localStorage
        const itineraryData = localStorage.getItem("itineraryData");
        if (!itineraryData) {
          setError("No itinerary data found.");
          setLoading(false);
          return;
        }

        const parsedItinerary = JSON.parse(itineraryData);
        const days = parsedItinerary.days || [];
        
        if (days.length === 0) {
          setError("No days found in itinerary.");
          setLoading(false);
          return;
        }

        setDays(days);
      } catch (err) {
        console.error("Failed to load trip days from localStorage:", err);
        setError("Could not load trip days.");
      } finally {
        setLoading(false);
      }
    }

    fetchDays();
  }, []);

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
            onClick={() => navigate("/")}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Go Home
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
          <h1 className="text-4xl font-bold text-gray-800">Your Trip Days</h1>
          <p className="text-lg text-gray-600">
            Review and modify each day of your itinerary
          </p>
        </div>

        {/* Days Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {days.map((day) => (
            <div
              key={day.dayIndex}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Day Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <h3 className="text-2xl font-bold">Day {day.dayIndex}</h3>
                {day.summary && (
                  <p className="text-blue-100 mt-2 text-sm">{day.summary}</p>
                )}
              </div>

              {/* Day Content */}
              <div className="p-6 space-y-4">
                {/* Time Blocks */}
                {["morning", "afternoon", "evening"].map((timeOfDay) => {
                  const block = day.blocks?.[timeOfDay];
                  return block ? (
                    <div key={timeOfDay} className="border-l-4 border-blue-200 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                          {timeOfDay}
                        </span>
                        {block.timeOfDay && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {block.timeOfDay}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">{block.title}</h4>
                      {block.description && (
                        <p className="text-gray-600 text-xs mb-2 line-clamp-2">{block.description}</p>
                      )}
                      {block.location && (
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="mr-1">📍</span>
                          {block.location}
                        </div>
                      )}
                      {block.isTicketed && (
                        <span className="inline-block text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full mt-2">
                          🎫 Ticketed
                        </span>
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

                {/* Modify Button */}
                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      // ✅ RESTORE: Use localStorage tripData for navigation (the correct breadcrumb!)
                      const tripData = JSON.parse(localStorage.getItem("tripData") || "null");
                      const tripId = tripData?.tripId || tripData?._id;
                      if (tripId) {
                        navigate(`/modify/day/${tripId}/${day.dayIndex}`);
                      } else {
                        navigate("/modify/day");
                      }
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 font-semibold text-sm"
                  >
                    🛠 Modify This Day
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

                 {/* Action Buttons */}
         <div className="flex flex-col gap-4 items-center pt-8">
           <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
             <button
               onClick={() => navigate("/tripwell/itinerarycomplete")}
               className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 font-semibold"
             >
               ✅ I'm Finished
             </button>
             <button
               onClick={() => navigate("/pretriphub")}
               className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 font-semibold"
             >
               💾 Save & Continue
             </button>
           </div>

           <div className="w-full max-w-xl bg-blue-50 text-blue-800 rounded-lg p-4 text-center text-sm">
             <p className="font-semibold">Ready to start your trip?</p>
             <p className="text-xs mt-1">Go to the Trip Hub and click <span className="font-semibold">"Start My Trip"</span> when you're ready to begin your adventure!</p>
           </div>
         </div>
      </div>
    </div>
  );
}
