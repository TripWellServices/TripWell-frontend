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
  const [askSaved, setAskSaved] = useState(false);

  // 🧠 On mount: validate user and trip
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

  // STEP 1️⃣ – Save the Ask
  const handleSaveAsk = async () => {
    if (!input.trim()) return;
    try {
      setError(null);
      setResponse(null);
      setAskSaved(false);

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

      if (!res.ok) throw new Error("Ask save failed");
      setAskSaved(true);
    } catch (err) {
      console.error("❌ Ask save failed:", err);
      setError("Something went wrong saving your ask.");
    }
  };

  // STEP 2️⃣ – Trigger GPT
  const handleRunGPT = async () => {
    try {
      setError(null);
      setResponse("⏳ Thinking...");

      const firebaseUser = auth.currentUser;
      const token = await firebaseUser.getIdToken(true);

      const res = await fetch(`https://gofastbackend.onrender.com/tripwell/${trip._id}/gpt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tripId: trip._id }), // You can add more context here if needed
      });

      if (!res.ok) throw new Error("GPT chat failed");
      const result = await res.json();
      setResponse(result?.reply || "No response.");
    } catch (err) {
      console.error("❌ GPT failed:", err);
      setResponse(null);
      setError("GPT failed to reply. Try again.");
    }
  };

  // ✨ Loading UX
  if (loading) return (
    <div className="p-10 text-center text-2xl text-gray-700 animate-pulse">
      🌍 Warming up the <span className="font-semibold text-purple-600">AI Travel Engine</span>…
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800">
        Hi traveler — what do you want to know about <span className="text-blue-600">{trip.destination}</span>?
      </h2>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`e.g., What's the best place for coffee in ${trip.destination}?`}
          className="flex-1 p-3 border rounded"
        />
        <button
          onClick={handleSaveAsk}
          className="bg-yellow-500 text-white px-4 rounded hover:bg-yellow-600 transition"
        >
          Save Ask
        </button>
      </div>

      {askSaved && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleRunGPT}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
          >
            ▶️ Run GPT
          </button>
          <div className="text-green-600 text-sm mt-2">
            ✅ Ask saved! Ready to generate response.
          </div>
        </div>
      )}

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
