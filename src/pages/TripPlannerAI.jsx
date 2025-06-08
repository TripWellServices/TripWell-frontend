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

  const handleSubmit = async () => {
    if (!input.trim()) return;
    try {
      setError(null);
      setResponse("Loading...");

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

      if (!res.ok) throw new Error("GPT chat failed");
      const result = await res.json();
      setResponse(result?.reply || "No response.");
    } catch (err) {
      console.error("❌ AI prompt failed:", err);
      setResponse(null);
      setError("Something went wrong. Try again later.");
    }
  };

  if (loading) return <div className="p-6">Loading trip info…</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">
        Hi traveler — what do you want to know about <span className="text-blue-600">{trip.destination}</span>?
      </h2>
      <p className="text-sm text-gray-500">
        You can ask about food, culture, activities, safety, or even hidden gems — and TripWell will respond with curated insights.
      </p>

      <div className="flex gap-2 mt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`e.g., What's the best place for coffee in ${trip.destination}?`}
          className="flex-1 p-3 border rounded"
        />
        <button
          onClick={handleSubmit}
          className="bg-purple-600 text-white px-4 rounded hover:bg-purple-700 transition"
        >
          Ask
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
