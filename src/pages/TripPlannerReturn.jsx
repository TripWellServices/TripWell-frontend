// src/pages/TripPlannerReturn.jsx
import { useNavigate } from "react-router-dom";

export default function TripPlannerReturn() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Welcome Back to Your Trip Planner</h1>

      <p className="text-gray-700">
        Good to see you again! Pick up where you left off, or start fresh.
      </p>

      <div className="bg-gray-100 p-4 rounded-md text-left space-y-2 text-sm">
        <p>🚀 Jump back into building your itinerary.</p>
        <p>📍 Or head straight to your saved plans to make updates.</p>
      </div>

      <div className="space-y-4">
        <button
          className="w-full bg-blue-600 text-white px-5 py-3 rounded-md hover:bg-blue-700 transition"
          onClick={() => navigate("/prepbuild")}
        >
          Build / Continue My Itinerary
        </button>

        <button
          className="w-full bg-green-600 text-white px-5 py-3 rounded-md hover:bg-green-700 transition"
          onClick={() => navigate("/itineraryupdate")}
        >
          View / Update Saved Itinerary
        </button>

        <button
          className="w-full bg-gray-300 text-gray-800 px-5 py-3 rounded-md hover:bg-gray-400 transition"
          onClick={() => navigate("/")}
        >
          Return Home
        </button>
      </div>
    </div>
  );
}
