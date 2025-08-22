import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import BACKEND_URL from "../config";

export default function PreLiveDay() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const [{ data: whoami }, { data: status }] = await Promise.all([
          axios.get(`${BACKEND_URL}/tripwell/whoami`),
          axios.get(`${BACKEND_URL}/tripwell/tripstatus`),
        ]);

        setRole(whoami.role);

        const alreadyStarted =
          (whoami.role === "originator" && status.tripStartedByOriginator) ||
          (whoami.role === "participant" && status.tripStartedByParticipant);

        if (alreadyStarted) {
          navigate(
            whoami.role === "originator"
              ? `/tripwell/live/${tripId}`
              : `/tripwell/participant/live/${tripId}`
          );
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("❌ Failed to hydrate trip info", err);
        setLoading(false);
      }
    };

    hydrate();
  }, [tripId, navigate]);

  const handleStart = async () => {
    try {
      await axios.patch(`${BACKEND_URL}/tripwell/starttrip/${tripId}`);
      navigate(
        role === "originator"
          ? `/tripwell/live/${tripId}`
          : `/tripwell/participant/live/${tripId}`
      );
    } catch (err) {
      console.error("❌ Failed to start trip", err);
    }
  };

  const handleReview = () => {
    navigate(`/tripwell/view-itinerary/${tripId}`);
  };

  if (loading) {
    return <div className="p-6 text-center">Loading your trip info...</div>;
  }

  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">🎉 Your Trip is Ready</h1>
      <p className="text-gray-700 mb-4">
        We’ll guide you through your adventure, block by block. You can make edits along the way, ask Angela questions, and capture your reflections.
      </p>
      <p className="text-gray-700 mb-6">
        Ready to begin, or want to review the itinerary one more time?
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
