import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { auth } from "../firebase";

export default function TripIntentForm() {
  const navigate = useNavigate();
  const { tripId } = useParams();

  const [user, setUser] = useState(null);
  const [tripStatus, setTripStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const [whoWith, setWhoWith] = useState("");
  const [priorities, setPriorities] = useState("");
  const [vibes, setVibes] = useState("");
  const [mobility, setMobility] = useState("");
  const [travelPace, setTravelPace] = useState("");
  const [budget, setBudget] = useState("");

  useEffect(() => {
    const hydrate = async () => {
      try {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
          navigate("/access");
          return;
        }

        const token = await firebaseUser.getIdToken(true);

        const whoamiRes = await axios.get("/tripwell/whoami", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const statusRes = await axios.get("/tripwell/tripstatus", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(whoamiRes.data.user);
        setTripStatus(statusRes.data);

        // ❗ No trip created, fallback
        if (!statusRes.data.tripId) {
          navigate("/tripwell/tripitineraryrequired");
          return;
        }

        // ✅ Already did intent? Skip forward
        if (statusRes.data.tripIntentId) {
          navigate(`/tripwell/${statusRes.data.tripId}/anchors`);
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error("❌ Error hydrating user or trip status", err);
        navigate("/access");
      }
    };

    hydrate();
  }, [navigate]);

  const handleSubmit = async () => {
    try {
      const token = await auth.currentUser.getIdToken(true);
      await axios.post(
        `/tripwell/tripintent/${tripId}`,
        {
          whoWith,
          priorities,
          vibes,
          mobility,
          travelPace,
          budget,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      navigate(`/tripwell/${tripId}/anchors`);
    } catch (err) {
      console.error("❌ Failed to save trip intent", err);
      alert("Could not save your intent. Try again.");
    }
  };

  if (loading) return <div className="p-6">Loading your trip...</div>;

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">🧠 What Kind of Trip is This?</h1>

      <input
        value={whoWith}
        onChange={(e) => setWhoWith(e.target.value)}
        placeholder="Traveling with (e.g., family, spouse, solo)"
        className="w-full p-3 border rounded"
      />
      <input
        value={priorities}
        onChange={(e) => setPriorities(e.target.value)}
        placeholder="Top priorities (e.g., memories, comfort)"
        className="w-full p-3 border rounded"
      />
      <input
        value={vibes}
        onChange={(e) => setVibes(e.target.value)}
        placeholder="Vibe (e.g., laid back, cultural, adventurous)"
        className="w-full p-3 border rounded"
      />
      <input
        value={mobility}
        onChange={(e) => setMobility(e.target.value)}
        placeholder="Mobility (e.g., limited, active)"
        className="w-full p-3 border rounded"
      />
      <input
        value={travelPace}
        onChange={(e) => setTravelPace(e.target.value)}
        placeholder="Travel pace (e.g., slow, full days)"
        className="w-full p-3 border rounded"
      />
      <input
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
        placeholder="Budget range (e.g., $$-$$$)"
        className="w-full p-3 border rounded"
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition"
      >
        Save Intent
      </button>
    </div>
  );
}
