// src/pages/TripIntentForm.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import BACKEND_URL from "../config";
import { fetchJSON } from "../utils/fetchJSON";

export default function TripIntentForm() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [whoWith, setWhoWith] = useState("");
  const [priorities, setPriorities] = useState("");
  const [vibes, setVibes] = useState("");
  const [mobility, setMobility] = useState("");
  const [travelPace, setTravelPace] = useState("");
  const [budget, setBudget] = useState("");

  // Hydrate user via /whoami
  useEffect(() => {
    const hydrate = async () => {
      try {
        // Wait for Firebase auth to be ready
        await new Promise(resolve => {
          const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            resolve(user);
          });
        });
        
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
          console.error("❌ No Firebase user after waiting");
          navigate("/access");
          return;
        }

        const token = await firebaseUser.getIdToken();

        const userData = await fetchJSON(`${BACKEND_URL}/tripwell/whoami`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store"
        });

        console.log("🔍 User data:", userData);

        if (!userData?.user) {
          navigate("/access");
          return;
        }

        // No trip yet → bounce to setup
        if (!userData.user.tripId) {
          navigate("/tripsetup");
          return;
        }

        setUser(userData.user);
      } catch (err) {
        console.error("❌ Error hydrating user:", err);
        navigate("/access");
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await auth.currentUser.getIdToken();

      await fetchJSON(`${BACKEND_URL}/tripwell/intent`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          tripId: user.tripId,
          whoWith,
          priorities,
          vibes,
          mobility,
          travelPace,
          budget,
        })
      });

      navigate("/tripprebuild");
    } catch (err) {
      console.error("❌ Failed to save trip intent", err);
      alert("Could not save your intent. Try again.");
    }
  };

  if (loading) return <div className="p-6">Loading your trip...</div>;

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">🧠 What Kind of Trip is This?</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          Traveling with:
          <input
            value={whoWith}
            onChange={(e) => setWhoWith(e.target.value)}
            placeholder="Family, spouse, solo..."
            className="w-full p-3 border rounded"
          />
        </label>
        <label className="block">
          Top priorities:
          <input
            value={priorities}
            onChange={(e) => setPriorities(e.target.value)}
            placeholder="Memories, comfort, adventure..."
            className="w-full p-3 border rounded"
          />
        </label>
        <label className="block">
          Vibe:
          <input
            value={vibes}
            onChange={(e) => setVibes(e.target.value)}
            placeholder="Laid back, cultural, adventurous..."
            className="w-full p-3 border rounded"
          />
        </label>
        <label className="block">
          Mobility:
          <input
            value={mobility}
            onChange={(e) => setMobility(e.target.value)}
            placeholder="Limited, active..."
            className="w-full p-3 border rounded"
          />
        </label>
        <label className="block">
          Travel pace:
          <input
            value={travelPace}
            onChange={(e) => setTravelPace(e.target.value)}
            placeholder="Slow, full days..."
            className="w-full p-3 border rounded"
          />
        </label>
        <label className="block">
          Budget range:
          <input
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="$$-$$$"
            className="w-full p-3 border rounded"
          />
        </label>

        <button
          type="submit"
          className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition"
        >
          Save Intent
        </button>
      </form>
    </div>
  );
}
