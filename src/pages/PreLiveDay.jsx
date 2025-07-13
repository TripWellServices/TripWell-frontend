import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function PreLiveDay() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [tripStarted, setTripStarted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const whoamiRes = await axios.get("/tripwell/whoami");
        const tripStatusRes = await axios.get("/tripwell/tripstatus");

        const role = whoamiRes.data.role;
        const status = tripStatusRes.data;

        setRole(role);

        const alreadyStarted =
          (role === "originator" && status.tripStartedByOriginator) ||
          (role === "participant" && status.tripStartedByParticipant);

        if (alreadyStarted) {
          const path =
            role === "originator"
              ? `/tripwell/live/${tripId}`
              : `/tripwell/participant/live/${tripId}`;
          navigate(path);
        } else {
          setTripStarted(false);
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
      await axios.patch(`/tripwell/starttrip/${tripId}`);
      const target = role === "originator"
        ? `/tripwell/live/${tripId}`
        : `/tripwell/participant/live/${tripId}`;
      navigate(target);
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
