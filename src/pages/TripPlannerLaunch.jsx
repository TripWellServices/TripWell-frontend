import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TripPlannerLaunch() {
  const [loading, setLoading] = useState(true);
  const [tripCity, setTripCity] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkTripStatus() {
      try {
        const statusRes = await axios.get("/tripwell/tripstatus");
        const { tripId, role } = statusRes.data;

        if (!tripId) {
          navigate("/tripwell/tripnotcreated");
          return;
        }

        if (role === "participant") {
          navigate("/tripwell/plannerparticipanthub");
          return;
        }

        // Optional city hydration for UX context
        const whoamiRes = await axios.get("/tripwell/whoami");
        const trip = whoamiRes.data?.trip;
        if (trip?.city) {
          setTripCity(trip.city);
        }
      } catch (err) {
        console.error("Error checking trip status:", err);
        navigate("/tripwell/tripnotcreated");
      } finally {
        setLoading(false);
      }
    }

    checkTripStatus();
  }, [navigate]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-700">
        <h2 className="text-xl font-semibold mb-2">Just a sec...</h2>
        <p>
          We’re loading your trip info and figuring out what you need next.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Build or Update Your Itinerary</h1>

      {tripCity && (
        <p className="mb-4 text-sm text-gray-700">
          You’re planning a trip to <span className="font-semibold">{tripCity}</span>. What would you like to do next?
        </p>
      )}

      <div className="flex flex-col gap-4">
        <button
          className="bg-blue-600 text-white px-4 py-3 rounded-md"
          onClick={() => navigate("/tripwell/prepbuild")}
        >
          Build My Itinerary
        </button>

        <button
          className="bg-green-600 text-white px-4 py-3 rounded-md"
          onClick={() => navigate("/tripwell/itineraryupdate")}
        >
          Update / View My Itinerary
        </button>
      </div>
    </div>
  );
}
