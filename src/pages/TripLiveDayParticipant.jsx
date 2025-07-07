// TripLiveDayParticipant.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function TripLiveDayParticipant() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNextPrompt, setShowNextPrompt] = useState(false);

  useEffect(() => {
    fetchLiveDay();
  }, [tripId]);

  async function fetchLiveDay() {
    try {
      const { data } = await axios.get(`/tripwell/triplive/${tripId}`);
      setToday(data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Failed to load today’s plan", err);
      setToday(null);
      setLoading(false);
    }
  }

  const handleMarkComplete = async () => {
    try {
      await axios.post(`/tripwell/markcomplete/${tripId}/${today.dayIndex}`);
      setShowNextPrompt(true);
    } catch (err) {
      console.error("❌ Error marking day complete", err);
    }
  };

  const handleShowNextDay = async () => {
    setLoading(true);
    await fetchLiveDay();
    setShowNextPrompt(false);
  };

  if (loading) return <div className="p-6">Loading today’s itinerary...</div>;
  if (!today) return <div className="p-6 text-lg">🎉 That’s it — your trip is complete!</div>;

  const dayLabel = `Day ${today.dayIndex + 1}`;
  const dateStr = today.dateStr || "(no date)";
  const { summary, blocks } = today;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">📍 Today’s Plan</h2>
      <p className="text-gray-700 mb-6">View your shared itinerary for today below.</p>

      <div className="mb-2 text-sm text-gray-500">{dayLabel} • {dateStr}</div>
      <p className="italic text-gray-600 mb-4">{summary}</p>

      <div className="grid gap-4 mb-8">
        {Object.entries(blocks).map(([slot, block]) => (
          <div key={slot} className="border rounded-xl p-4 shadow">
            <h3 className="font-semibold capitalize">{slot}</h3>
            <p className="text-gray-800">{block?.title || "(No title)"}</p>
            <p className="text-gray-500 text-sm">{block?.desc || "(No description)"}</p>
          </div>
        ))}
      </div>

      {showNextPrompt ? (
        <div className="border-t pt-6 mt-6 text-center">
          <p className="text-lg font-medium mb-4">✅ All set for today.</p>
          <button
            onClick={handleShowNextDay}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl"
          >
            ➡️ Show Next Day
          </button>
        </div>
      ) : (
        <div className="border-t pt-6 flex flex-col gap-4">
          <button
            onClick={handleMarkComplete}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl"
          >
            ✅ Mark Today Complete
          </button>
          <button
            onClick={() => navigate(`/tripwell/journal/${tripId}/${today.dayIndex}`)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl"
          >
            📓 Journal My Experience
          </button>
        </div>
      )}
    </div>
  );
}