import { useEffect, useState } from "react";
import { useTripContext } from "../context/TripContext";

const baseUrl = "https://gofastbackend.onrender.com";

export default function TripPlannerAI() {
  const { user, trip, loading } = useTripContext();
  const [userText, setUserText] = useState("");
  const [gptReply, setGptReply] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = async () => {
    if (!userText.trim()) return;

    setSending(true);
    setError(null);

    try {
      const token = await user?.firebaseToken; // or fetch it via firebaseUser if stored separately

      const res = await fetch(`${baseUrl}/tripchat/${trip._id}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: userText,
        }),
      });

      if (!res.ok) throw new Error("GPT request failed");

      const result = await res.json();
      setGptReply(result.reply || "No response from GPT.");
    } catch (err) {
      console.error("❌ GPT error:", err);
      setError("Something went wrong.");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-6">Loading trip planner...</div>;
  if (!trip || !user) return <div className="p-6 text-red-600">Trip or user not found.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Plan with AI ✨</h1>
      <p className="text-sm text-gray-500">Trip to <strong>{trip.city}</strong>, {trip.startDate} → {trip.endDate}</p>

      <textarea
        value={userText}
        onChange={(e) => setUserText(e.target.value)}
        placeholder="Ask AI to help plan your trip..."
        className="w-full border rounded p-3 text-sm"
        rows={4}
      />

      <button
        onClick={handleSend}
        disabled={sending}
        className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50"
      >
        {sending ? "Sending..." : "Send to AI"}
      </button>

      {error && <p className="text-red-600">{error}</p>}

      {gptReply && (
        <div className="bg-gray-50 border border-gray-300 rounded p-4 whitespace-pre-wrap text-sm">
          {gptReply}
        </div>
      )}
    </div>
  );
}
