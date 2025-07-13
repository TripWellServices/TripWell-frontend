import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TripItineraryUpdateFromSave() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDays() {
      try {
        const statusRes = await axios.get("/tripwell/tripstatus");
        const { tripId } = statusRes.data;

        if (!tripId) {
          navigate("/tripwell/tripitineraryrequired");
          return;
        }

        const res = await axios.get(`/tripwell/itinerary/days/${tripId}`);
        setDays(res.data || []);
      } catch (err) {
        console.error("Failed to fetch saved itinerary:", err);
        setError("Could not load your saved itinerary.");
      } finally {
        setLoading(false);
      }
    }

    fetchDays();
  }, [navigate]);

  if (loading) return <p className="p-4">Loading itinerary...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Your Saved Itinerary</h2>
      <p className="mb-4 text-sm text-gray-600">
        Review your generated itinerary below. Want to make changes? You can edit any day.
      </p>

      <div className="space-y-4">
        {days.map((day) => (
          <div key={day.dayIndex} className="border rounded-xl p-4 shadow">
            <h3 className="font-semibold mb-1">Day {day.dayIndex}</h3>
            <p className="italic mb-2">{day.summary}</p>

            {["morning", "afternoon", "evening"].map((part) => {
              const block = day.blocks?.[part];
              return block ? (
                <div key={part} className="mb-2">
                  <strong className="capitalize">{part}:</strong>{" "}
                  <span>{block.title}</span>
                </div>
              ) : null;
            })}

            <button
              onClick={() => {
                localStorage.setItem("modifyDayIndex", day.dayIndex);
                navigate("/tripwell/modify/day");
              }}
              className="mt-2 text-sm text-blue-600 underline"
            >
              Modify this day
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-2">
        <button
          className="bg-green-600 text-white rounded-lg px-4 py-2"
          onClick={() => navigate("/tripwell/home")}
        >
          ✅ Return Home
        </button>

        <p className="text-xs text-gray-500 text-center">
          To begin your trip, go to the Home page and click{" "}
          <strong>“Start My Trip”</strong>.
        </p>
      </div>
    </div>
  );
}
