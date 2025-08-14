// src/pages/TripIntentForm.jsx - MVP1 SIMPLE VERSION
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import BACKEND_URL from "../config";
import { fetchJSON } from "../utils/fetchJSON";

export default function TripIntentForm() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Simple text inputs for MVP1
  const [priorities, setPriorities] = useState("");
  const [vibes, setVibes] = useState("");

  // Hydrate user via /whoami - matching TripIDTest.jsx pattern
  useEffect(() => {
    async function hydrateTripId() {
      try {
        // ✅ Wait until Firebase is ready
        await new Promise(resolve => {
          const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe();
            resolve(user);
          });
        });

        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
          console.error("❌ No Firebase user after waiting");
          return;
        }

        const token = await firebaseUser.getIdToken();

        const data = await fetchJSON(`${BACKEND_URL}/tripwell/whoami`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store"
        });

        console.log("WHOAMI RESPONSE:", data);
        setUser(data?.user);
      } catch (err) {
        console.error("Error fetching user data", err);
      } finally {
        setLoading(false);
      }
    }

    hydrateTripId();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (submitting) return;

    setSubmitting(true);

    try {
      const payload = {
        tripId: user?.tripId,
        userId: user?._id,
        priorities: priorities.trim(),
        vibes: vibes.trim(),
      };

      console.log("🔍 Current state:", { priorities, vibes });
      console.log("📤 Sending payload:", payload);
      console.log("🔑 User tripId:", user?.tripId);

      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${BACKEND_URL}/tripwell/tripintent`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json().catch(() => ({}));
      console.log("tripintent resp", res.status, data);

      if (res.ok) {
        console.log("✅ Trip intent saved successfully");
        navigate("/anchorselect");
      } else {
        alert(data.error || `Save failed (${res.status})`);
      }
    } catch (err) {
      console.error("❌ Failed to save trip intent", err);
      alert("Could not save your intent. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Check if form has any input
  const hasInput = priorities.trim() || vibes.trim();

  if (loading) return <div className="p-6">Loading your trip...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        🧠 What Kind of Trip is This? (MVP1)
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Priorities Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            🎯 What are your top priorities for this trip?
          </h2>
          <p className="text-gray-600 mb-4">
            Just type something like "food, history, adventure"
          </p>
          <input
            type="text"
            value={priorities}
            onChange={(e) => setPriorities(e.target.value)}
            placeholder="e.g., Food & dining, Historical sites, Adventure"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Vibes Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            🌟 What's the vibe you're going for?
          </h2>
          <p className="text-gray-600 mb-4">
            Just type something like "romantic, budget-friendly"
          </p>
          <input
            type="text"
            value={vibes}
            onChange={(e) => setVibes(e.target.value)}
            placeholder="e.g., Romantic, Budget-friendly, Social"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={!hasInput || submitting}
          className={`w-full py-4 px-6 rounded-lg transition text-lg font-semibold ${
            hasInput && !submitting
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {submitting ? "Saving..." : (hasInput ? 'Save Trip Intent' : 'Please fill in something first')}
        </button>

      </form>
    </div>
  );
}
