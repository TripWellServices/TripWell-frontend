// TripItineraryRequired.jsx

import { useNavigate } from "react-router-dom";

export default function TripItineraryRequired() {
  const navigate = useNavigate();

  return (
    <div className="max-w-xl mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold text-yellow-600 mb-4">
        📭 Trip Not Ready Yet
      </h1>
      <p className="mb-6 text-gray-700">
        Looks like your trip isn’t fully built yet.
        <br />
        Your planner is probably still finalizing the itinerary.
        <br /><br />
        Once it’s ready, you’ll be able to join in and view the full plan!
      </p>

      <button
        onClick={() => navigate("/tripwell/home")}
        className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400"
      >
        ⬅️ Back to Home
      </button>
    </div>
  );
}
