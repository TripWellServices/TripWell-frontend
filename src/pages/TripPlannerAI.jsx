import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

export default function TripPlannerAI() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  // 🧠 On mount: hydrate from token via /whoami
  useEffect(() => {
    const fetchData = async () => {
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

    fetchData();
  }, [navigate]);

  const handleAskAndReply = async () => {
    if (!input.trim()) return;
    if (!trip?._id) {
      setError("Trip not ready");
      return;
    }

    try {
      setError(null);
      setResponse("Loading...");

      const firebaseUser = auth.currentUser;
      const token = await firebaseUser.getIdToken(true);

      // Step 1: Save Ask
      const askRes = await fetch(`https://gofastbackend.onrender.com/tripwell/${trip._id}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userInput: input,
        }),
      });

      if (!askRes.ok) throw new Error("Failed to log ask");

      // Step 2: Trigger GPT
      await new Promise((r) => setTimeout(r, 250)); // debounce for write safety

      const gptRes = await fetch(`https://gofastbackend.onrender.com/tripwell/${trip._id}/gpt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ token-only, no userData
        },
      });

      if (!gptRes.ok) throw new Error("GPT reply failed");

      const gptData = await gptRes.json();
      setResponse(gptData.gptReply || "No GPT response.");
    } catch (err) {
      console.error("❌ Full ask-reply flow failed:", err);
      setResponse(null);
      setError("Something went wrong. Try again later.");
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-2xl font-semibold text-center text-gray-700">
        🧠 Warming up the AI travel engine…
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800">
        Hi {user.preferredName}, what do you want to know about <span className="text-blue-600">{trip.destination}</span>?
      </h2>

      <p className="text-sm text-gray-500">
        Ask about food, culture, safety, or hidden gems. TripWell AI will respond with curated ideas.
      </p>

      <div className="flex gap-2 mt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`e.g., Where to eat in ${trip.destination}?`}
          className="flex-1 p-3 border rounded"
        />
        <button
          onClick={handleAskAndReply}
          className="bg-purple-600 text-white px-4 rounded hover:bg-purple-700 transition"
          disabled={!input.trim() || loading}
        >
          Ask GPT
        </button>
      </div>

      {response && (
        <div className="bg-gray-100 p-4 rounded mt-4 whitespace-pre-wrap">
          {response}
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm mt-2">
          {error}
        </div>
      )}
    </div>
  );
}
