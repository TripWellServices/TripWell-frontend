import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BACKEND_URL from "../config";

export default function TripLiveDay() {
  const [tripData, setTripData] = useState(null);
  const navigate = useNavigate();

  // Hydrate trip status (backend → local)
  useEffect(() => {
    const hydrate = async () => {
      try {
        // Get tripId from localStorage
        const tripData = JSON.parse(localStorage.getItem("tripData") || "null");
        if (!tripData?.tripId) {
          console.error("❌ No tripId found in localStorage");
          navigate("/");
          return;
        }

        const res = await axios.get(`${BACKEND_URL}/tripwell/livestatus/${tripData.tripId}`);
        const updatedTripData = {
          tripId: res.data.tripId,
          currentDay: res.data.currentDayIndex,
          currentBlock: res.data.currentBlock,
          tripComplete: res.data.tripComplete,
          totalDays: res.data.totalDays,
          dayData: res.data.dayData
        };
        localStorage.setItem("tripData", JSON.stringify(updatedTripData));
        setTripData(updatedTripData);
      } catch (err) {
        console.warn("⚠️ Backend hydrate failed:", err);
        const local = JSON.parse(localStorage.getItem("tripData") || "null");
        setTripData(local || { currentDay: 1, currentBlock: "morning", tripComplete: false });
      }
    };
    hydrate();
  }, [navigate]);

  if (!tripData) return <p>Loading...</p>;

  return (
    <div className="p-8 max-w-2xl mx-auto text-center">
      <h1 className="text-3xl font-bold">Day {tripData.currentDay}</h1>
      <p className="text-lg text-gray-600">Block: {tripData.currentBlock}</p>
      <button
        onClick={() => navigate("/tripliveblock")}
        className="mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg"
      >
        Start {tripData.currentBlock}
      </button>
      
      {tripData.tripComplete && (
        <div className="mt-4 p-4 bg-green-100 rounded-lg">
          <p className="text-green-800">🎉 Trip Complete!</p>
          <button
            onClick={() => navigate("/tripcomplete")}
            className="mt-2 bg-green-600 text-white py-2 px-4 rounded"
          >
            View Completion
          </button>
        </div>
      )}
    </div>
  );
}
