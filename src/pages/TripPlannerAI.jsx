import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

export default function TripPlannerAI() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [askId, setAskId] = useState(null);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  // ✅ On mount: hydrate user/trip
  useEffect(() => {
    const fetchUserAndTrip = async () => {
      try {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) return navigate("/explainer");
        const token = await firebaseUser.getIdToken(true);

        const res = await fetch("https://gofastbackend.onrender.com/tripwell/whoami", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!data?.user?._id) return navigate("/explainer");
        if (!data?.trip?._id) return navigate("/generalhub");

        setUser(data.user);
        setTrip(data.trip);
        setLoading(false);
      } catch (err) {
        console.error("❌ WhoAmI failed:", err);
        navigate("/explainer");
      }
    };

    fetchUserAndTrip();
  }, [navigate]);

  // 🧠 Step 1: Save Ask
  const handleSaveAsk = async () => {
    if (!input.trim()) return;
    try {
      setError(null);
      setResponse("Saving your question…");

      const firebaseUser = auth.currentUser;
      const token = await firebaseUser.getIdToken(true);

      const res = await fetch(`https://gofastbackend.onrender.com/tripwell/${trip._id}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userInput: input,
          tripData: trip,
          userData: user,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.askId) throw new Error("Failed to save ask");

      setAskId(result.askId);
      setResponse("✅ Question saved. Ready to ask GPT.");
    } catch (err) {
      console.error("❌ Save ask failed:", err);
      setError("Could not save question.");
      setResponse(null);
    }
  };

  // 🤖 Step 2: Trigger GPT
  const handleAskGPT = async () => {
    if (!askId) return setError("Ask must be saved first.");

    try {
      setError(null);
      setResponse("Talking to GPT…");

      const firebaseUser = auth.currentUser;
      const token = await firebaseUser.getIdToken(true);

      const res = await fetch(`https://gofastbackend.onrender.com/tripwell/${trip._id}/gpt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ askId }),
      });

      const result = await res.json();
      if (!res.ok || !result.reply) throw new Error("GPT failed");

      setResponse(result.reply);
    } catch (err) {
      console.error("❌ GPT call failed:", err);
      setError("GPT failed.");
      setResponse(null);
    }
  };

  if (loading) return <div className="p-6">Loading trip info…</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">
        Ask about <span className="text-blue-600">{trip.destination}</span>
      </h2>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={`e.g., Best place for coffee in ${trip.destination}?`}
        className="w-full p-3 border rounded"
      />

      <div className="flex gap-2">
        <button
          onClick={handleSaveAsk}
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-black"
        >
          Save Ask
        </button>

        <button
          onClick={handleAskGPT}
          disabled={!askId}
          className={`px-4 py-2 rounded ${
            askId ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-300"
          } text-white`}
        >
          Hit GPT
        </button>
      </div>

      {response && (
        <div className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
          {response}
        </div>
      )}

      {error && <div className="text-red-600 text-sm">{error}</div>}
    </div>
  );
}
