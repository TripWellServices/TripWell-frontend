import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

export default function TripPlanner() {
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [user, setUser] = useState(null);
  const [scene, setScene] = useState("");
  const [loading, setLoading] = useState(true);

  const [priorities, setPriorities] = useState([]);
  const [vibes, setVibes] = useState([]);
  const [mobility, setMobility] = useState("");

  const priorityOptions = ["Food", "Attractions", "Adventure", "Relaxation", "Culture"];
  const vibeOptions = ["Romantic", "Chill", "High Energy", "Family-Friendly", "Surprise Me"];
  const mobilityOptions = ["Walk Everywhere", "Bike or Scooter", "Public Transit", "Day Trips OK"];

  useEffect(() => {
    const hydrate = async () => {
      try {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) return navigate("/explainer");

        const token = await firebaseUser.getIdToken(true);
        const res = await fetch("https://gofastbackend.onrender.com/tripwell/whoami", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { user, trip } = await res.json();
        if (!user || !trip) return navigate("/explainer");

        setUser(user);
        setTrip(trip);

        const sceneRes = await fetch(`https://gofastbackend.onrender.com/tripwell/gpt/scenesetter/${trip._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await sceneRes.json();
        setScene(data.scene || "");
      } catch (err) {
        console.error("TripPlanner load failed", err);
        navigate("/explainer");
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, [navigate]);

  const toggle = (value, list, setter) => {
    setter(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  };

  const handleNext = async () => {
    try {
      const token = await auth.currentUser.getIdToken(true);

      await fetch("https://gofastbackend.onrender.com/tripwell/intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tripId: trip._id,
          priorities,
          vibes,
          mobility,
        }),
      });

      navigate("/anchor-select");
    } catch (err) {
      console.error("Intent save failed", err);
    }
  };

  if (loading) return <div className="p-6">Loading your trip...</div>;

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-green-700">Let’s Get Started</h1>

      {scene && (
        <div className="bg-gray-100 p-4 rounded shadow text-gray-800">
          <p className="italic">{scene}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h2 className="font-semibold">What matters most on this trip?</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {priorityOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => toggle(opt, priorities, setPriorities)}
                className={`px-3 py-1 rounded border ${
                  priorities.includes(opt) ? "bg-green-500 text-white" : "bg-white text-gray-700"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-semibold">What vibe do you want?</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {vibeOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => toggle(opt, vibes, setVibes)}
                className={`px-3 py-1 rounded border ${
                  vibes.includes(opt) ? "bg-blue-500 text-white" : "bg-white text-gray-700"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-semibold">How do you want to get around?</h2>
          <div className="flex flex-col gap-2 mt-2">
            {mobilityOptions.map((opt) => (
              <label key={opt} className="flex items-center gap-2">
                <input
                  type="radio"
                  value={opt}
                  checked={mobility === opt}
                  onChange={() => setMobility(opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleNext}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded shadow mt-6"
        >
          Next: Choose Anchors
        </button>
      </div>
    </div>
  );
}
