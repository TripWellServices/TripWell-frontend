import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BACKEND_URL from "../config";

export default function TripLiveBlock() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const tripData = JSON.parse(localStorage.getItem("tripData") || "null");

  if (!tripData) return <p>No active trip.</p>;

  const handleCompleteBlock = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/tripwell/doallcomplete`, {
        tripId: tripData.tripId,
        dayIndex: tripData.currentDay,
        blockName: tripData.currentBlock
      });

      const nextStep = res.data?.next || "continue";

      // Update local tripData
      let updatedTripData = { ...tripData };
      if (nextStep === "lookback") {
        updatedTripData.currentBlock = "reflection";
      } else if (nextStep === "continue") {
        if (tripData.currentBlock === "morning") updatedTripData.currentBlock = "afternoon";
        else if (tripData.currentBlock === "afternoon") updatedTripData.currentBlock = "evening";
      } else if (nextStep === "tripcomplete") {
        updatedTripData.tripComplete = true;
      }

      localStorage.setItem("tripData", JSON.stringify(updatedTripData));

      // Navigate based on server
      if (nextStep === "lookback") {
        navigate("/tripdaylookback");
      } else if (nextStep === "tripcomplete") {
        navigate("/tripcomplete");
      } else {
        navigate("/tripliveblock"); // continue next block
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
