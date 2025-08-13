// src/pages/TripPlannerReturn.jsx
import { useNavigate } from "react-router-dom";

export default function TripPlannerReturn() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Trip Planner Return (TEST MODE)</h1>

      <p className="mb-6 text-sm text-gray-700">
        No auth checks. No trip checks. Choose where to go:
      </p>

      <div className="flex flex-col gap-4">
        <button
          className="bg-blue-600 text-white px-4 py-3 rounded-md"
          onClick={() => navigate("/tripprebuild")}
        >
          Go to Trip Prebuild
        </button>

        <button
          className="bg-green-600 text-white px-4 py-3 rounded-md"
          onClick={() => navigate("/itineraryupdate")}
        >
          Go to Itinerary Update
        </button>
      </div>
    </div>
  );
}
