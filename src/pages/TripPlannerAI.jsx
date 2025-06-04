import { useState, useEffect } from "react";
import axios from "axios";

export default function TripPlannerAI({ tripId, userData = {} }) {
  const [userText, setUserText] = useState("");
  const [gptReply, setGptReply] = useState(null);
  const [tripData, setTripData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Load trip data on mount
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await axios.get(`/api/trips/tripbase/${tripId}`);
        setTripData(res.data);
      } catch (err) {
        console.error("🔥 Failed to load trip data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (tripId) fetchTrip();
  }, [tripId]);

  const handleSend = async () => {
    if (!userText.trim()) return;
    setSending(true);
    try {
      const res = await axios.post(`/trip/${tripId}/chat`, {
        userInput: userText,
        tripData,
        userData,
      });
      setGptReply(res.data.reply);
    } catch (err) {
      console.error("🔥 GPT chat failed:", err);
    }
    setSending(false);
  };

  const userName = userData?.name?.split(" ")[0] || "Traveler";
  const city = tripData?.city;
  const dateRange = tripData?.dateRange;

  // === Render: Loading State ===
  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500 italic">
        Loading your trip info...
      </div>
    );
  }

  // === Render: Error State ===
  if (!tripData) {
    return (
      <div className="p-6 text-center text-red-500">
        Trip not found or failed to load.
      </div>
    );
  }

  // === Render: AI Planner ===
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">🧠 TripWell Assistant</h2>

      <div className="text-gray-700 mb-6">
        <p className="text-lg font-semibold">
          Welcome {userName}, your trip to <strong>{city}</strong> awaits!
        </p>
        {dateRange && (
          <p className="text-sm text-gray-600 mb-2">Dates: {dateRange}</p>
        )}
        <p className="mt-3">
          Use this assistant to help shape your perfect itinerary. Just tell us what you’re dreaming of:
        </p>
        <ul className="list-disc list-inside mt-2 mb-4">
          <li>Where you're staying?</li>
          <li>Food or events you want to hit?</li>
          <li>What kind of vibe you’re after?</li>
        </ul>
        <p className="italic text-gray-600">
          Example: “Staying at Rom de la Pen. Want coffee spots, walkable streets, and something fun for my kid.”
        </p>
      </div>

      <textarea
        className="w-full h-40 border rounded p-4 mb-4"
        placeholder="Drop your notes, plans, or ideas here..."
        value={userText}
        onChange={(e) => setUserText(e.target.value)}
      />

      <button
        onClick={handleSend}
        disabled={sending}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {sending ? "Thinking..." : "Send to TripWell AI"}
      </button>

      {gptReply && (
        <div className="mt-6 bg-gray-50 border-l-4 border-blue-500 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">TripWell AI Says:</h3>
          <p className="text-gray-800 whitespace-pre-line">{gptReply}</p>
        </div>
      )}
    </div>
  );
}
