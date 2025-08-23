import { useState } from "react";
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

export default function TripLiveBlock() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const tripData = JSON.parse(localStorage.getItem("tripData") || "null");
  const itineraryData = JSON.parse(localStorage.getItem("itineraryData") || "null");

  if (!tripData || !itineraryData) return <p>No active trip.</p>;

  const { currentDayIndex, currentBlockName } = getCurrentState();

  const handleCompleteBlock = async () => {
    setLoading(true);
    try {
      // Tell backend this block is complete
      const res = await axios.post(`${BACKEND_URL}/tripwell/doallcomplete`, {
        tripId: tripData.tripId,
        dayIndex: currentDayIndex,
        blockName: currentBlockName
      });

      // Advance the progressive navigation pointer
      advanceBlock();
      
      // Check if we're at the end of the day (evening complete)
      const isEndOfDay = currentBlockName === "evening";
      const isEndOfTrip = currentDayIndex >= itineraryData.days.length;

      // Navigate based on state
      if (isEndOfDay) {
        navigate("/tripdaylookback"); // Day complete, do reflection
      } else if (isEndOfTrip) {
        navigate("/tripcomplete"); // Trip complete
      } else {
        navigate("/tripliveday"); // Back to live day view
      }
    } catch (err) {
      console.error("❌ Block complete failed:", err);
      alert("Could not save progress.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto text-center">
      <h1 className="text-2xl font-bold">Block: {tripData.currentBlock}</h1>
      <p className="mt-2 text-gray-600">Day {tripData.currentDay}</p>

      <button
        disabled={loading}
        onClick={handleCompleteBlock}
        className="mt-6 bg-green-600 text-white py-3 px-6 rounded-lg"
      >
        {loading ? "Saving..." : "✅ Complete Block"}
      </button>
    </div>
  );
}
