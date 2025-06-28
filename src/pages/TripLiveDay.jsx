// src/pages/TripLiveDay.jsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function TripLiveDay() {
  const { tripId } = useParams();
  const [tripDays, setTripDays] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTripDays() {
      try {
        const { data } = await axios.get(`/tripwell/itinerary/days/${tripId}`);
        setTripDays(data);
        setLoading(false);
      } catch (err) {
        console.error("❌ Failed to load trip days", err);
      }
    }
    fetchTripDays();
  }, [tripId]);

  const handleMarkComplete = async () => {
    try {
      await axios.post(`/tripwell/livestatus/${tripId}`, { dayIndex: currentIndex });
      setCurrentIndex((prev) => prev + 1);
    } catch (err) {
      console.error("❌ Error marking day complete", err);
    }
  };

  if (loading) return <div className="p-6">Loading trip days...</div>;
  if (currentIndex >= tripDays.length) return <div className="p-6 text-lg">🎉 You've completed your trip!</div>;

  const today = tripDays[currentIndex];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🚀 Live My Trip – Day {today.dayIndex + 1}</h2>
      <p className="mb-2 text-gray-600 italic">{today.summary}</p>

      <div className="grid gap-4">
        {Object.entries(today.blocks).map(([slot, block]) => (
          <div key={slot} className="border rounded-xl p-4 shadow">
            <h3 className="font-semibold capitalize">{slot}</h3>
            <p className="text-gray-700">{block?.title || "(No title)"}</p>
            <p className="text-gray-500 text-sm">{block?.desc || "(No description)"}</p>
          </div>
        ))}
      </div>

      <button
        onClick={handleMarkComplete}
        className="mt-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl"
      >
        ✅ Mark Day {today.dayIndex + 1} Complete
      </button>
    </div>
  );
}
