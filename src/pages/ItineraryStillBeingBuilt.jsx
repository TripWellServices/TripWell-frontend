import { useNavigate } from "react-router-dom";

export default function ItineraryStillBeingBuilt() {
  const navigate = useNavigate();

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6 text-center">
      <h1 className="text-2xl font-bold">Trip Plan Coming Soon</h1>

      <p className="text-gray-700">
        Your trip organizer is still shaping the itinerary. Once it’s ready,
        you’ll get full access to explore, edit, and follow along.
      </p>

      <p className="text-gray-700">
        In the meantime, feel free to send them a quick note with your ideas —
        any must-see spots, dream meals, or things you’re hoping to do.
      </p>

      <p className="text-sm text-gray-500">
        (Just message them however you normally chat — text, email, carrier pigeon.)
      </p>

      <button
        onClick={() => navigate("/")}
        className="mt-6 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition"
      >
        🔙 Back to Home
      </button>
    </div>
  );
}
