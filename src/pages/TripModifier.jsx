import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function TripModify() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [days, setDays] = useState([]);

  useEffect(() => {
    const fetchTripDays = async () => {
      try {
        const res = await axios.get(`/tripwell/itinerary/${tripId}/days`);
        setDays(res.data);
      } catch (err) {
        console.error("Failed to load trip days", err);
      }
    };

    fetchTripDays();
  }, [tripId]);

  if (!tripId) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        🚫 Missing tripId. Please return to home.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center mb-4">✏️ Modify Your Trip</h1>

      {days.map((day, idx) => (
        <div
          key={idx}
          className="border rounded-xl p-4 shadow hover:shadow-lg transition-all"
        >
          <h2 className="text-lg font-semibold mb-2">Day {day.dayIndex + 1}</h2>
          <p className="text-gray-700 italic mb-2">{day.summary}</p>

          <div className="text-sm space-y-1 text-gray-600">
            {["morning", "afternoon", "evening"].map((block) => (
              <div key={block}>
                <span className="font-semibold capitalize">{block}: </span>
                {day.blocks?.[block]?.title || "–"}
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate(`/tripwell/modifyday/${tripId}/${day.dayIndex}`)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            ✏️ Modify This Day
          </button>
        </div>
      ))}
    </div>
  );
}