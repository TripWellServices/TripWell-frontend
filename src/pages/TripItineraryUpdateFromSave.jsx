import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TripItineraryUpdateFromSave() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchItinerary() {
      try {
        const statusRes = await axios.get("/tripwell/tripstatus");
        const { tripId } = statusRes.data;

        if (!tripId) {
          navigate("/tripwell/tripitineraryrequired");
          return;
        }

        const res = await axios.get(`/tripwell/itinerary/days/${tripId}`);
        const tripDays = res.data;

        if (!tripDays || tripDays.length === 0) {
          navigate("/tripwell/prepbuild");
          return;
        }

        setDays(tripDays);
      } catch (err) {
        console.error("Itinerary load error:", err);
        setError("Could not load your saved itinerary.");
      } finally {
        setLoading(false);
      }
    }

    fetchItinerary();
  }, [navigate]);

  if (loading) return <div className="p-6 text-center">Loading your itinerary...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Your Trip — Built for Experience</h1>
      <p className="text-gray-600 text-sm">
        This is your saved itinerary. Review the days below or modify your trip as needed.
      </p>

      <div className="space-y-4">
        {days.map((day) => (
          <div key={day.dayIndex} className="border rounded-xl p-4 shadow">
            <h2 className="font-semibold mb-2">Day {day.dayIndex}</h2>
            <p className="italic text-sm mb-2">{day.summary}</p>

            {["morning", "afternoon", "evening"].map((part) => {
              const block = day.blocks?.[part];
              return block ? (
                <div key={part} className="mb-1">
                  <strong className="capitalize">{part}:</strong> {block.title}
                </div>
              ) : null;
            })}
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-3">
        <button
          onClick={() => navigate("/tripwell/itinerary/modify")}
          className="bg-yellow-500 text-white px-5 py-2 rounded-lg hover:bg-yellow-600"
        >
          🛠 Modify My Itinerary
        </button>

        <button
          onClick={() => navigate("/tripwell/home")}
          className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
        >
          ✅ Return Home
        </button>

        <p className="text-center text-xs text-gray-500">
          To begin your trip, go to <strong>Home</strong> and click <em>“Start My Trip”</em>.
        </p>
      </div>
    </div>
  );
}
