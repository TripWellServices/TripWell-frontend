import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BACKEND_URL from "../config";

export default function TripComplete() {
  const navigate = useNavigate();
  const tripData = JSON.parse(localStorage.getItem("tripData") || "null");

  useEffect(() => {
    // No need to call separate tripcomplete endpoint
    // Trip completion is handled by doallcomplete route
    // Just ensure localStorage is updated
    if (tripData && !tripData.tripComplete) {
      const updated = { ...tripData, tripComplete: true };
      localStorage.setItem("tripData", JSON.stringify(updated));
      console.log("💾 Trip marked complete in localStorage");
    }
  }, [tripData]);

  return (
    <div className="p-8 max-w-2xl mx-auto text-center space-y-6">
      <h1 className="text-4xl font-bold text-green-700">🎉 Trip Complete</h1>
      <p className="text-lg text-gray-700">The trip may be over, but your memories remain.</p>

      <div className="space-y-4 mt-8">
        <button
          onClick={() => navigate(`/reflections`)}
          className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg"
        >
          📓 See My Trip Memories
        </button>
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
          className="w-full bg-gray-100 hover:bg-gray-200 py-3 rounded-xl text-lg"
        >
          ✈️ Plan Another Trip
        </button>
      </div>
    </div>
  );
}
