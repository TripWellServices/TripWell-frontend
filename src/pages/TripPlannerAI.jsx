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

  const handAsk = async () => {
    if (!input.trim() || !trip?._id) {
      setError("Trip or input missing");
      return;
    }

    try {
      setError(null);
      setResponse("Ask saved. Ready to run GPT…");

      const firebaseUser = auth.currentUser;
      const token = await firebaseUser.getIdToken(true);

      const askRes = await fetch(`https://gofastbackend.onrender.com/tripwell/${trip._id}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userInput: input }),
      });

      if (!askRes.ok) throw new Error("Failed to save ask");

      setInput(""); // Clear input after save
    } catch (err) {
      console.error("❌ handAsk failed:", err);
      setError("Couldn’t save your question. Try again.");
      setResponse(null);
    }
  };

  const handRunGPT = async () => {
    if (!trip?._id || !user) {
      setError("Trip or user not ready");
      return;
    }

    try {
      setError(null);
      setResponse("Thinking...");

      const firebaseUser = auth.currentUser;
      const token = await firebaseUser.getIdToken(true);

      await new Promise((r) => setTimeout(r, 250)); // debounce for write safety

      const gptRes = await fetch(`https://gofastbackend.onrender.com/tripwell/${trip._id}/gpt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userData: {
            firebaseId: user.firebaseId || user.userId,
          },
        }),
      });

      if (!gptRes.ok) throw new Error("GPT reply failed");

      const gptData = await gptRes.json();
      setResponse(gptData.gptReply || "No GPT response.");
    } catch (err) {
      console.error("❌ handRunGPT failed:", err);
      setError("GPT reply error. Try again.");
      setResponse(null);
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
        Hi {user.preferredName}, what do you want to know about{" "}
        <span className="text-blue-600">{trip.destination}</span>?
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
          onClick={handAsk}
          className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700 transition"
          disabled={!input.trim() || loading}
        >
          Save Ask
        </button>
        <button
          onClick={handRunGPT}
          className="bg-purple-600 text-white px-4 rounded hover:bg-purple-700 transition"
          disabled={loading}
        >
          Run GPT
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
