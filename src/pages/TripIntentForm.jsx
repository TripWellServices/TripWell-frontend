import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../firebase";

export default function TripIntentForm() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [tripId, setTripId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [priorities, setPriorities] = useState("");
  const [vibes, setVibes] = useState("");
  const [mobility, setMobility] = useState("");
  const [budget, setBudget] = useState("");
  const [travelPace, setTravelPace] = useState("");

  useEffect(() => {
    let hydrated = false;

    async function hydrateUser() {
      try {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) return; // no user yet

        const token = await firebaseUser.getIdToken(true);

        const whoamiRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL || "https://gofastbackend.onrender.com"}/tripwell/whoami`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("🔍 WHOAMI RESPONSE:", whoamiRes.data);

        const userData = whoamiRes.data.user;
        setUser(userData || null);
        setTripId(userData?.tripId || null);

      } catch (err) {
        console.error("❌ WHOAMI failed:", err.response?.status, err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    }

    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (!hydrated && firebaseUser) {
        hydrated = true;
        hydrateUser();
      } else if (!firebaseUser) {
        navigate("/access");
      }
    });

    return unsubscribe;
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = await auth.currentUser.getIdToken(true);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || "https://gofastbackend.onrender.com"}/tripwell/tripintent`,
        { priorities, vibes, mobility, budget, travelPace },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/anchorselect");
    } catch (err) {
      console.error("❌ Failed to save trip intent:", err.response?.status, err.response?.data || err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-700">
        <h2 className="text-xl font-semibold mb-2">Just a sec...</h2>
        <p>Loading your trip info...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      {/* Debug: show tripId for testing */}
      <div className="p-2 bg-gray-100 text-gray-700 rounded">
        tripId: {tripId || "null"}
      </div>

      <h1 className="text-2xl font-bold mb-4">🧠 What Kind of Trip is This?</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={priorities}
          onChange={(e) => setPriorities(e.target.value)}
          placeholder="What are your priorities?"
          className="w-full p-3 border rounded"
        />

        <input
          value={vibes}
          onChange={(e) => setVibes(e.target.value)}
          placeholder="What vibes are you going for?"
          className="w-full p-3 border rounded"
        />

        <input
          value={mobility}
          onChange={(e) => setMobility(e.target.value)}
          placeholder="Any mobility considerations?"
          className="w-full p-3 border rounded"
        />

        <select
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="w-full p-3 border rounded"
        >
          <option value="">Select budget range</option>
          <option value="budget">Budget-friendly</option>
          <option value="moderate">Moderate</option>
          <option value="luxury">Luxury</option>
        </select>

        <select
          value={travelPace}
          onChange={(e) => setTravelPace(e.target.value)}
          className="w-full p-3 border rounded"
        >
          <option value="">Select travel pace</option>
          <option value="relaxed">Relaxed</option>
          <option value="balanced">Balanced</option>
          <option value="active">Active</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition"
        >
          Continue to Anchor Selection
        </button>
      </form>
    </div>
  );
}
