import { useState } from "react";
import axios from "axios";

export default function TripPlannerAI({ tripId, userData = {} }) {
  const [userText, setUserText] = useState("");
  const [gptReply, setGptReply] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const baseUrl = "https://gofastbackend.onrender.com";

  const handleSend = async () => {
    if (!userText.trim()) return;
    setSending(true);
    setError(null);

    try {
      const res = await axios.post(`${baseUrl}/trip/${tripId}/chat`, {
        userInput: userText,
        tripData: {}, // required by backend, send empty if no data
        userData,
      });

      setGptReply(res.data.reply || "No response from AI.");
      setUserText("");
    } catch (err) {
      console.error("🔥 GPT chat failed:", err);
      setError("AI assistant failed to respond.");
    } finally {
      setSending(false);
    }
  };

  const userName = userData?.name?.split(" ")[0] || "Adam";

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">🧠 TripWell Assistant</h2>

      <div className="text-gray-700 mb-6">
        <p className="text-lg font-semibold">
          Alright {userName}, ready to plan this trip? Let’s f***ing go. 🔥✈️
        </p>
        <p className="mt-3">
          Tell me what’s in your head — vibe, food, schedule, chaos, dreams. Drop it below:
        </p>
        <p className="italic text-gray-600 mt-2">
          Example: “Need ocean views, epic tacos, kid-friendly spots, and some chill downtime in the morning.”
        </p>
      </div>

      <textarea
        className="w-full h-40 border rounded p-4 mb-4"
        placeholder="Drop your trip brain dump here..."
        value={userText}
        onChange={(e) => setUserText(e.target.value)}
        disabled={sending}
      />

      <button
        onClick={handleSend}
        disabled={sending}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {sending ? "Spinning magic..." : "Send to TripWell AI"}
      </button>

      {error && <div className="mt-4 text-red-600 font-semibold">{error}</div>}

      {gptReply && (
        <div className="mt-6 bg-gray-50 border-l-4 border-blue-500 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">TripWell AI Says:</h3>
          <p className="text-gray-800 whitespace-pre-line">{gptReply}</p>
        </div>
      )}
    </div>
  );
}
