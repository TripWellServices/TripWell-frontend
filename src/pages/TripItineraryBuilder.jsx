import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthConfig } from "../utils/auth";
import BACKEND_URL from "../config";

export default function TripItineraryBuilder() {
  const navigate = useNavigate();
  const [itineraryDays, setItineraryDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Get data from localStorage
  const userData = JSON.parse(localStorage.getItem("userData") || "null");
  const tripData = JSON.parse(localStorage.getItem("tripData") || "null");
  const tripIntentData = JSON.parse(localStorage.getItem("tripIntentData") || "null");
  const anchorSelectData = JSON.parse(localStorage.getItem("anchorSelectData") || "null");

  useEffect(() => {
    async function buildItinerary() {
      try {
        // ✅ FIX: Use standardized auth utility
        const authConfig = await getAuthConfig();

        // Step 1: Build itinerary via Angela (GPT)
        const res = await fetch(`${BACKEND_URL}/tripwell/itinerary/build`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authConfig.headers
          },
          body: JSON.stringify({ tripId: tripData.tripId }),
        });
        
        if (!res.ok) {
          throw new Error(`Build failed: ${res.status}`);
        }
        
        const buildData = await res.json();
        const { daysSaved } = buildData;

        // Step 2: Get structured itinerary data
        const savedDaysRes = await fetch(`${BACKEND_URL}/tripwell/itinerary/days/${tripData.tripId}`, {
          headers: authConfig.headers
        });
        
        if (savedDaysRes.ok) {
          const savedDays = await savedDaysRes.json();
          setItineraryDays(savedDays);
        } else {
          // Fallback to basic structure if API fails
          setItineraryDays([{
            dayIndex: 1,
            summary: "Angela generated your itinerary. Check the modify section for details.",
            blocks: {}
          }]);
        }
      } catch (err) {
        console.error("Itinerary generation error:", err);
        // ✅ FIX: Add proper error handling
        if (err.message.includes("401") || err.message.includes("Unauthorized")) {
          setError("Authentication error. Please sign in again.");
          setTimeout(() => navigate("/access"), 2000);
        } else {
          setError("Something went wrong while building your itinerary.");
        }
      } finally {
        setLoading(false);
      }
    }

    buildItinerary();
  }, [tripData.tripId, navigate]);

  async function handleSave() {
    try {
      setSaving(true);
      
      // Save to localStorage for test flow
      const itineraryData = {
        itineraryId: "generated-itinerary-id",
        days: itineraryDays
      };
      localStorage.setItem("itineraryData", JSON.stringify(itineraryData));
      console.log("💾 Saved itineraryData to localStorage:", itineraryData);
      
      navigate("/prephub");
    } catch (err) {
      console.error("Save error:", err);
      setError("Could not save itinerary.");
    } finally {
      setSaving(false);
    }
  }

  function handleModify() {
    navigate("/tripwell/itineraryupdate");
  }

  // If no localStorage data, show error
  if (!userData || !tripData || !tripIntentData || !anchorSelectData) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Missing Data</h1>
          <p className="text-gray-600">Please start from the beginning.</p>
          <button 
            onClick={() => navigate("/")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="text-xl font-semibold text-gray-700">Building your itinerary with Angela...</h2>
          <p className="text-gray-500">This may take a moment</p>
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
          <h1 className="text-4xl font-bold text-gray-800">Your Trip Itinerary</h1>
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-blue-600 mb-2">{tripData.tripName}</h2>
            <p className="text-gray-600">
              <span className="font-medium">{tripData.city}</span> • {tripData.daysTotal} days
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Generated by Angela, your AI travel assistant
            </p>
          </div>
        </div>

        {/* Itinerary Days */}
        <div className="space-y-6">
          {itineraryDays.map((day, index) => (
            <div key={day.dayIndex || index} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Day Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <h3 className="text-2xl font-bold">Day {day.dayIndex || index + 1}</h3>
                {day.summary && (
                  <p className="text-blue-100 mt-2 text-lg">{day.summary}</p>
                )}
              </div>

              {/* Day Activities */}
              {day.blocks && Object.keys(day.blocks).length > 0 ? (
                <div className="p-6 space-y-4">
                  {Object.entries(day.blocks).map(([timeOfDay, block]) => (
                    <div key={timeOfDay} className="border-l-4 border-blue-200 pl-4">
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                          {timeOfDay}
                        </span>
                        {block.timeOfDay && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {block.timeOfDay}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-1">{block.title}</h4>
                      {block.description && (
                        <p className="text-gray-600 text-sm mb-2">{block.description}</p>
                      )}
                      {block.location && (
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="mr-1">📍</span>
                          {block.location}
                        </div>
                      )}
                      {block.neighborhoodTag && (
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <span className="mr-1">🏘️</span>
                          {block.neighborhoodTag}
                        </div>
                      )}
                      {block.isTicketed && (
                        <span className="inline-block text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full mt-2">
                          🎫 Ticketed
                        </span>
                      )}
                      {block.isDayTrip && (
                        <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full mt-2 ml-2">
                          🌅 Full Day Trip
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>Activities will be available in the modify section</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center pt-8">
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-2xl shadow-lg hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 font-semibold"
            disabled={saving}
          >
            {saving ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </span>
            ) : (
              "✅ This looks great – Save it"
            )}
          </button>

          <button
            onClick={handleModify}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-2xl shadow-lg hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 font-semibold"
          >
            🛠 I want to modify
          </button>
        </div>
      </div>
    </div>
  );
}
