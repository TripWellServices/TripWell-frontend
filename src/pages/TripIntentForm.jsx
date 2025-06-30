import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

export default function TripIntentForm() {
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [priorities, setPriorities] = useState([]);
  const [vibes, setVibes] = useState([]);
  const [mobility, setMobility] = useState([]);
  const [travelPace, setTravelPace] = useState([]);
  const [budget, setBudget] = useState("");

  const priorityOptions = ["Food", "Attractions", "Adventure", "Relaxation", "Culture"];
  const vibeOptions = ["Romantic", "Chill", "High Energy", "Family-Friendly", "Surprise Me"];
  const mobilityOptions = ["Walk", "Bike", "Public Transit", "Ride Share / Taxi"];
  const travelPaceOptions = ["Stay in one place", "Jump around", "Take day trips"];

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
      } catch (err) {
        console.error("TripIntentForm load failed", err);
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
      const userId = auth.currentUser.uid;

      if (!trip || !trip._id || !userId) {
        console.error("Missing trip or userId!");
        return;
      }

      await fetch(`https://gofastbackend.onrender.com/tripwell/tripintent/${trip._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          priorities,
          vibes,
          mobility,
          budget,
          travelPace,
        }),
      });

      console.log("Trip intent saved!");
      navigate(`/tripwell/${trip._id}/anchors`);
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
        <h2 style={{ fontWeight: "bold", marginBottom: "8px" }}>What’s the vibe?</h2>
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
              type="checkbox"
              checked={mobility.includes(opt)}
              onChange={() => toggle(opt, mobility, setMobility)}
            />{" "}
            {opt}
          </label>
        ))}
      </div>

      {/* Travel Pace */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontWeight: "bold", marginBottom: "8px" }}>What pace do you prefer?</h2>
        {travelPaceOptions.map((opt) => (
          <label key={opt} style={{ display: "block", marginBottom: "6px" }}>
            <input
              type="checkbox"
              checked={travelPace.includes(opt)}
              onChange={() => toggle(opt, travelPace, setTravelPace)}
            />{" "}
            {opt}
          </label>
        ))}
      </div>

      {/* Budget */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontWeight: "bold", marginBottom: "8px" }}>What’s your budget per day?</h2>
        <input
          type="text"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="e.g., $150"
          style={{ width: "100%", padding: "8px", fontSize: "16px" }}
        />
      </div>

      <button
        onClick={handleNext}
        style={{
          padding: "12px 20px",
          fontSize: "16px",
          fontWeight: "bold",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Next
      </button>
    </div>
  );
}
