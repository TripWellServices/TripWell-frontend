import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import axios from "axios";

export default function TripLiveDay() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dayData, setDayData] = useState(null);
  const [currentBlock, setCurrentBlock] = useState(null);
  const [currentDayIndex, setCurrentDayIndex] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 🚨 SIMULATE BACKEND CALL WITH FRONTEND DATA!
    console.log("🚀 Simulating /tripwell/livestatus/${tripId} call with frontend data");
    
    try {
      // Get data from localStorage
      const tripData = JSON.parse(localStorage.getItem("tripData") || "null");
      const itineraryData = JSON.parse(localStorage.getItem("itineraryData") || "null");
      
      console.log("🔍 localStorage tripData:", tripData);
      console.log("🔍 localStorage itineraryData:", itineraryData);
      console.log("🔍 SURGICAL - itineraryData.days structure:", itineraryData.days);
      console.log("🔍 SURGICAL - first day sample:", itineraryData.days?.[0]);
      console.log("🔍 SURGICAL - all day indices:", itineraryData.days?.map(d => ({ dayIndex: d.dayIndex, summary: d.summary?.substring(0, 50) })));
      
      if (!tripData || !itineraryData) {
        throw new Error("Missing trip or itinerary data in localStorage");
      }

      // 🚨 SIMULATE BACKEND RESPONSE STRUCTURE
      // Since we don't have completion tracking, we'll simulate a fresh trip start
      
      // Get current day index from localStorage (set by PreTripHub)
      const currentDayIndex = parseInt(localStorage.getItem("currentDayIndex") || "1");
      const totalDays = itineraryData.days.length;
      
      console.log("🔍 SURGICAL DEBUG:");
      console.log("  - currentDayIndex from localStorage:", currentDayIndex);
      console.log("  - totalDays:", totalDays);
      console.log("  - itineraryData.days:", itineraryData.days);
      
      // Find the current day data
      const currentDay = itineraryData.days.find(day => day.dayIndex === currentDayIndex);
      console.log("  - currentDay found:", currentDay);
      
      if (!currentDay) {
        console.log("❌ SURGICAL ERROR: No day found for index", currentDayIndex);
        console.log("  - Available day indices:", itineraryData.days.map(d => d.dayIndex));
        console.log("  - SURGICAL FIX: Using first available day instead");
        
        // FALLBACK: Use the first available day if there's a mismatch
        const fallbackDay = itineraryData.days[0];
        if (fallbackDay) {
          console.log("  - Using fallback day:", fallbackDay);
          const actualDayIndex = fallbackDay.dayIndex;
          console.log("  - Actual day index in data:", actualDayIndex);
          // Update localStorage to match the actual data
          localStorage.setItem("currentDayIndex", actualDayIndex.toString());
          currentDayIndex = actualDayIndex;
        } else {
          throw new Error(`No data found for day ${currentDayIndex} and no fallback available`);
        }
      }
      
      // Since we don't have completion tracking, always start with morning block
      let currentBlock = "morning";
      
      // Check if trip is complete (only if we're past the last day)
      const isLastDay = currentDayIndex === totalDays;
      const tripComplete = false; // No completion tracking yet, so always false
      
      // Build day data (mimics the backend structure)
      const dayData = {
        city: tripData.city,
        dateStr: new Date(tripData.startDate).toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        summary: currentDay.summary || "Ready for your adventure!",
        blocks: currentDay.blocks || {}
      };
      
      // Simulate the exact backend response structure
      const simulatedBackendResponse = {
        tripId: tripData.tripId || tripData._id,
        currentDayIndex,
        currentBlock,
        totalDays,
        tripComplete,
        dayData
      };

      // Extract data from simulated backend response (like the real component would)
      const { currentDayIndex, currentBlock, dayData, tripComplete } = simulatedBackendResponse;

      if (tripComplete) {
        navigate("/tripcomplete");
        return;
      }

      setCurrentDayIndex(currentDayIndex);
      setCurrentBlock(currentBlock);
      setDayData(dayData);
      
      console.log("✅ Simulated backend response:", simulatedBackendResponse);
      
    } catch (err) {
      console.error("❌ Backend simulation failed:", err);
      setError(err.message || "Failed to simulate backend call");
    } finally {
      setLoading(false);
    }
  }, [tripId, navigate]);

  if (loading) return <div className="p-6 text-center">Loading today's plan...</div>;
  
  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600">❌ Error Loading Live Day</h1>
        <p className="text-gray-600">{error}</p>
        <div className="space-y-2">
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg mr-2"
          >
            🔄 Try Again
          </button>
          <button 
            onClick={() => window.location.href = "/prephub"} 
            className="bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            🏠 Back to Trip Hub
          </button>
        </div>
      </div>
    );
  }
  
  if (!dayData) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600">❌ No Itinerary Data</h1>
        <p className="text-gray-600">Couldn't load today's itinerary.</p>
        <div className="space-y-2">
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg mr-2"
          >
            🔄 Try Again
          </button>
          <button 
            onClick={() => navigate("/prephub")} 
            className="bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            🏠 Back to Trip Hub
          </button>
        </div>
      </div>
    );
  }

  const { city, dateStr, summary, blocks } = dayData;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="text-sm text-gray-500 mb-2">
        📍 {city} • {dateStr || "Unknown date"} • Day {currentDayIndex}
      </div>

      <h1 className="text-2xl font-bold mb-4">Here’s today’s plan — ready to begin?</h1>
      <p className="italic text-gray-700 mb-6">{summary}</p>

      <div className="grid gap-4 mb-8">
        {["morning", "afternoon", "evening"].map((slot) => (
          <div key={slot} className="border rounded-xl p-4 shadow">
            <h3 className="font-semibold capitalize">{slot}</h3>
            <p className="text-gray-800">{blocks?.[slot]?.title || "(No title)"}</p>
            <p className="text-gray-500 text-sm">{blocks?.[slot]?.desc || "(No description)"}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={() =>
            navigate("/tripliveblock", {
              state: {
                blockName: currentBlock,
                dayIndex: currentDayIndex,
                blockData: blocks?.[currentBlock],
              },
            })
          }
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-lg"
        >
          ✅ Let’s Go
        </button>
      </div>
    </div>
  );
}
