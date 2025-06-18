import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

export default function TripPlanner() {
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [priorities, setPriorities] = useState([]);
  const [vibes, setVibes] = useState([]);
  const [mobility, setMobility] = useState("");
  const [budget, setBudget] = useState("");

  const priorityOptions = ["Food", "Attractions", "Adventure", "Relaxation", "Culture"];
  const vibeOptions = ["Romantic", "Chill", "High Energy", "Family-Friendly", "Surprise Me"];
  const mobilityOptions = ["Walk Everywhere", "Bike or Scooter", "Public Transit", "Day Trips OK"];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/explainer");
        return;
      }

      try {
        const token = await firebaseUser.getIdToken(true);

        const res = await fetch("https://gofastbackend.onrender.com/tripwell/whoami", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { user, trip } = await res.json();
        if (!user || !trip) {
          navigate("/explainer");
          return;
        }

        setUser(user);
        setTrip(trip);

        // GPT scene fetch temporarily removed

      } catch (err) {
        console.error("TripPlanner load failed", err);
        navigate("/explainer");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const toggle = (value, list, setter) => {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
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
          budget,
        }),
      });

      // No redirect yet – just testing submission
    } catch (err) {
      console.error("Intent save failed", err);
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading your trip...</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}>Let’s Get Started</h1>

      <p style={{ marginBottom: "20px" }}>
        In order to best plan your trip, we need to get a sense of what you want to do, your budget,
        and how you like to travel.
      </p>

      {/* Priorities */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontWeight: "bold", marginBottom: "8px" }}>What matters most on this trip?</h2>
        {priorityOptions.map((opt) => (
          <label key={opt} style={{ display: "block", marginBottom: "6px" }}>
            <input
              type="checkbox"
              checked={priorities.includes(opt)}
              onChange={() => toggle(opt, priorities, setPriorities)}
            />{" "}
            {opt}
          </label>
        ))}
      </div>

      {/* Vibes */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontWeight: "bold", marginBottom: "8px" }}>What vibe do you want?</h2>
        {vibeOptions.map((opt) => (
          <label key={opt} style={{ display: "block", marginBottom: "6px" }}>
            <input
              type="checkbox"
              checked={vibes.includes(opt)}
              onChange={() => toggle(opt, vibes, setVibes)}
            />{" "}
            {opt}
          </label>
        ))}
      </div>

      {/* Mobility */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontWeight: "bold", marginBottom: "8px" }}>How do you want to get around?</h2>
        {mobilityOptions.map((opt) => (
          <label key={opt} style={{ display: "block", marginBottom: "6px" }}>
            <input
              type="radio"
              value={opt}
              checked={mobility === opt}
              onChange={() => setMobility(opt)}
            />{" "}
            {opt}
          </label>
        ))}
      </div>

      {/* Budget */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontWeight: "bold", marginBottom: "8px" }}>
          Roughly, what’s your daily spend target (in USD)?
        </h2>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          style={{ padding: "8px", width: "100%", fontSize: "16px" }}
          placeholder="e.g. 150"
        />
      </div>

      {/* Save Button */}
      <button
        onClick={handleNext}
        style={{
          width: "100%",
          backgroundColor: "black",
          color: "white",
          padding: "12px",
          fontSize: "16px",
          fontWeight: "bold",
          border: "none",
          cursor: "pointer",
        }}
      >
        Save
      </button>
    </div>
  );
}
