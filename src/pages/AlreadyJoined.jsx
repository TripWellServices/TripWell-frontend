import { useNavigate } from "react-router-dom";

export default function AlreadyJoined() {
  const navigate = useNavigate();

  return (
    <div className="max-w-xl mx-auto p-8 text-center space-y-6">
      <h1 className="text-3xl font-bold text-green-700">You're Already In</h1>
      <p className="text-gray-700 text-lg">
        You’ve already joined your trip — nice job.
      </p>
      <p className="text-gray-500">
        If you'd like to review your itinerary, check your reflection journal, or just explore — use the homepage below.
      </p>

      <button
        onClick={() => navigate("/")}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg"
      >
        🏠 Return to Home
      </button>
    </div>
  );
}