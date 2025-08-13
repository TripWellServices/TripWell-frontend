import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TripPreBuild() {
  const [tripData, setTripData] = useState(null);
  const [tripId, setTripId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function hydrateTrip() {
      try {
        const whoamiRes = await axios.get("/tripwell/whoami");
        if (whoamiRes.data?.user?.trip) {
          setTripData(whoamiRes.data.user.trip);
          setTripId(whoamiRes.data.user.trip._id);
        }
      } catch (err) {
        console.warn("⚠️ Could not hydrate user trip data.");
      } finally {
        setLoading(false);
      }
    }

    hydrateTrip();
  }, [navigate]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-700">
        <h2 className="text-xl font-semibold mb-2">Just a sec...</h2>
        <p>We’re loading your trip and getting Angela ready to help you plan.</p>
      </div>
    );
  }

  if (!tripData) return null;

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Welcome to Your Trip Planner</h1>

      <p className="text-gray-700">
        You're planning a trip to <span className="font-semibold">{tripData.city}</span>.
        TripWell’s AI assistant <strong>Angela</strong> is here to guide you through it — fast.
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
          onClick={() => navigate(`/tripintent`)}
          className="w-full bg-blue-600 text-white px-5 py-3 rounded-md hover:bg-blue-700 transition"
        >
          🚀 Let's Plan!
        </button>

        <button
          onClick={async () => {
            try {
              const statusRes = await axios.get("/tripwell/tripstatus");
              const { intentExists, anchorsExist, daysExist } = statusRes.data.tripStatus || statusRes.data;

              // Smart routing based on progress:
              if (!intentExists) {
                navigate(`/tripintent`);
                return;
              }
              if (!anchorsExist) {
                navigate("/anchorselect");
                return;
              }
              if (!daysExist) {
                navigate("/tripwell/itinerarybuild");
                return;
              }
              // All complete → go to saved itinerary
              navigate("/tripwell/itineraryupdate");
            } catch (err) {
              console.error("❌ Failed to check trip status:", err);
              navigate(`/tripintent/${tripId}`); // fallback
            }
          }}
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
