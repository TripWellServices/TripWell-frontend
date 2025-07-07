import { useNavigate } from "react-router-dom";

export default function TripIntentRequired() {
  const navigate = useNavigate();

  return (
    <div className="max-w-xl mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold text-red-700 mb-4">
        🧠 Tell Us What Matters First
      </h1>
      <p className="mb-6 text-gray-700">
        Before we generate personalized anchor ideas, we need to understand your trip priorities,
        travel style, and what kind of vibe you're going for.
        <br /><br />
        This helps us make the itinerary truly yours — not just a list of places.
      </p>

      <div className="flex gap-4 justify-center">
        <button
          onClick={() => navigate("/tripwell/tripintent")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          📝 Fill Out Trip Intent
        </button>
        <button
          onClick={() => navigate("/tripwell/home")}
          className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400"
        >
          ⬅️ Go Back Home
        </button>
      </div>
    </div>
  );
}
