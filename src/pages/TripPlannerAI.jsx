import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserAndTrip } from "../services/userService";

const BACKEND_URL = "https://gofastbackend.onrender.com";

export default function TripPlannerAI() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [trip, setTrip] = useState(null);

  // 🚦 Load + validate user + trip
  useEffect(() => {
    (async () => {
      const { user, trip } = await getUserAndTrip();

      if (!user || !user._id) {
        navigate("/explainer"); // 🚨 No user in Mongo → onboarding
      } else if (!trip || !trip._id) {
        navigate("/generalhub"); // 🚧 User exists but no trip
      } else {
        setUser(user);
        setTrip(trip);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!prompt.trim() || !user || !trip) return;

    setLoading(true);
    try {
      const token = await user.firebaseToken;
      const res = await fetch(`${BACKEND_URL}/tripwell/${trip._id}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user._id,
          tripId: trip._id,
          userInput: prompt,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat failed");

      setResponse(data.message || "No response from AI");
    } catch (err) {
      console.error("❌ AI prompt failed:", err);
      alert("Failed to get AI response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Hi {user?.displayName || "traveler"}, what do you want to ask about {trip?.city}?
      </h1>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
        placeholder="Ask anything about your trip…"
        className="w-full p-4 border rounded resize-none"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {loading ? "Thinking…" : "Ask GPT"}
      </button>

      {response && (
        <div className="bg-gray-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">GPT Says:</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
