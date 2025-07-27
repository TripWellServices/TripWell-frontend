import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserAndTrip } from "../services/userService";

export default function PlannerParticipantHub() {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const hydrate = async () => {
      try {
        const { user, trip } = await getUserAndTrip();
        if (!trip || !trip._id) {
          navigate("/tripnotcreated");
          return;
        }
        setTrip(trip);
      } catch (err) {
        console.error("❌ Failed to hydrate participant hub", err);
        navigate("/tripnotcreated");
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, [navigate]);

  if (loading) {
    return <div className="p-6 text-gray-600">Loading your trip info…</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center text-blue-700">
        👋 Welcome to Your TripWell Hub
      </h1>

      <p className="text-gray-700 text-center">
        You're on this journey as a participant. Your trip organizer is building the experience — but you can explore what’s taking shape.
      </p>

      <div className="mt-8 space-y-4 text-center">
        <button
          onClick={() => navigate("/curatedhighlights")}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg"
        >
          🌟 View Curated Highlights
        </button>

        <button
          onClick={() => navigate("/tripwell/itinerary")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg"
        >
          📋 View Trip Itinerary
        </button>
      </div>

      <div className="mt-10 text-center">
        <button
          onClick={() => navigate("/")}
          className="text-sm text-gray-500 underline"
        >
          ⬅️ Back to Home
        </button>
      </div>
    </div>
  );
}
