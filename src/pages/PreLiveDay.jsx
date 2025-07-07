import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function PreLiveDay() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const handleStart = async () => {
    try {
      await axios.post(`/tripwell/starttrip/${tripId}`);
      navigate(`/tripwell/live/${tripId}`);
    } catch (err) {
      console.error("❌ Failed to start trip", err);
    }
  };

  const handleReview = () => {
    navigate(`/tripwell/view-itinerary/${tripId}`);
  };

  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">🎉 Your Trip is Ready</h1>
      <p className="text-gray-700 mb-4">
        We’ll guide you through your adventure, day by day. You can adjust things along the way, mark days complete, and journal your experience.
      </p>
      <p className="text-gray-700 mb-6">
        Ready to start your journey now, or want to review the itinerary one more time?
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={handleStart}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-lg"
        >
          ✅ Start My Trip
        </button>
        <button
          onClick={handleReview}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl text-lg"
        >
          🧭 Review Itinerary
        </button>
      </div>
    </div>
  );
}