// src/pages/TripPrebuild.jsx
import { useNavigate } from "react-router-dom";

export default function TripPrebuild() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Welcome to Your Trip Planner</h1>

      <p className="text-gray-700">
        You're planning a trip! TripWell's AI assistant <strong>Angela</strong> is here to guide you through it — fast.
      </p>

      <div className="bg-gray-100 p-4 rounded-md text-left space-y-2 text-sm">
        <p>🧭 Step 1: Set your travel intent — vibes, priorities, pace.</p>
        <p>📍 Step 2: Choose 3 anchor experiences. Angela will help you pick.</p>
        <p>🛠️ Step 3: Angela builds your personalized itinerary, day by day.</p>
      </div>

      <p className="text-sm text-gray-600">
        Total time: about 5 minutes. Angela will do most of the heavy lifting.
      </p>

      <div className="space-y-4">
        <button
          onClick={() => navigate("/tripintent")}
          className="w-full bg-blue-600 text-white px-5 py-3 rounded-md hover:bg-blue-700 transition"
        >
          🚀 I'm Ready to Plan My Trip
        </button>

        <button
          onClick={() => navigate("/tripprebuild")}
          className="w-full bg-green-600 text-white px-5 py-3 rounded-md hover:bg-green-700 transition"
        >
          📍 Take Me Where I Left Off
        </button>

        <button
          onClick={() => navigate("/")}
          className="w-full bg-gray-300 text-gray-800 px-5 py-3 rounded-md hover:bg-gray-400 transition"
        >
          🏠 Return Home
        </button>
      </div>
    </div>
  );
}
