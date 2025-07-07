import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function TripItineraryHydrate() {
  const { tripId } = useParams();
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTripDays() {
      try {
        const res = await axios.get(`/tripwell/itinerary/days/${tripId}`);
        setDays(res.data || []);
      } catch (err) {
        console.error("Failed to fetch trip days:", err);
        setError("Could not load your itinerary.");
      } finally {
        setLoading(false);
      }
    }

    fetchTripDays();
  }, [tripId]);

  if (loading) return <div className="p-6 text-center">Loading your itinerary…</div>;
  if (error) return <div className="p-6 text-red-600 text-center">{error}</div>;
  if (!days.length) return <div className="p-6 text-center text-gray-500">No saved itinerary found yet.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center text-green-700">Your Final Trip Itinerary</h1>

      {days.map((day, index) => (
        <div key={index} className="bg-white shadow rounded-xl p-4 border">
          <h2 className="text-xl font-semibold mb-2">Day {index + 1}</h2>
          <p className="text-gray-700 mb-3 italic">{day.summary}</p>

          {["morning", "afternoon", "evening"].map((block) => (
            <div key={block} className="mb-2">
              <p className="font-semibold capitalize">{block}:</p>
              <p className="text-gray-800">{day.blocks?.[block]?.title || "—"}</p>
              <p className="text-sm text-gray-600">{day.blocks?.[block]?.desc || "No description."}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
