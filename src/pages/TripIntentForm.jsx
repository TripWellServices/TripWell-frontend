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
    async function hydrateUser() {
      try {
        // Wait for Firebase auth to be ready
        if (!auth.currentUser) {
          console.log("⏳ Waiting for Firebase auth...");
          return;
        }

        // Get ID token
        const token = await auth.currentUser.getIdToken(true);
        
        // Call whoami to get full user object
        const whoamiRes = await axios.get("/tripwell/whoami", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        
        console.log("🔍 WHOAMI RESPONSE:", whoamiRes.data);
        
        const userData = whoamiRes.data.user;
        if (!userData?._id) {
          console.error("❌ No user ID in whoami response");
          navigate("/access");
          return;
        }

        setUser(userData);

        // Check if user has a trip
        if (!userData.tripId) {
          console.log("❌ No tripId found, routing to tripsetup");
          navigate("/tripsetup");
          return;
        }

        setTripId(userData.tripId);
        console.log("✅ Hydration complete - tripId:", userData.tripId);

      } catch (err) {
        console.error("❌ WHOAMI failed:", err.response?.status, err.response?.data || err.message);
        
        if (err.response?.status === 401) {
          console.log("🔒 401 Unauthorized, routing to access");
          navigate("/access");
        } else {
          console.error("❌ Unexpected error during hydration:", err);
          navigate("/access");
        }
      } finally {
        setLoading(false);
      }
    }

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        hydrateUser();
      } else {
        console.log("❌ No Firebase user, routing to access");
        navigate("/access");
      }
    });

    return unsubscribe;
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!tripId) {
      console.error("❌ No tripId available for submission");
      return;
    }
    
    try {
      const token = await auth.currentUser.getIdToken(true);
      await axios.post(
        `/tripwell/tripintent`,
        {
          priorities,
          vibes,
          mobility,
          budget,
          travelPace,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      navigate(`/anchorselect`);
    } catch (err) {
      console.error("❌ Failed to save trip intent:", err.response?.status, err.response?.data || err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-700">
        <h2 className="text-xl font-semibold mb-2">Just a sec...</h2>
        <p>We're loading your trip info and getting ready to plan.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">🧠 What Kind of Trip is This?</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={priorities}
          onChange={(e) => setPriorities(e.target.value)}
          placeholder="What are your priorities? (e.g., food, culture, relaxation)"
          className="w-full p-3 border rounded"
        />

        <input
          value={vibes}
          onChange={(e) => setVibes(e.target.value)}
          placeholder="What vibes are you going for? (e.g., laid back, cultural, adventurous)"
          className="w-full p-3 border rounded"
        />

        <input
          value={mobility}
          onChange={(e) => setMobility(e.target.value)}
          placeholder="Any mobility considerations? (e.g., walking, wheelchair accessible)"
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
          <option value="relaxed">Relaxed - take it slow</option>
          <option value="balanced">Balanced - mix of activity and rest</option>
          <option value="active">Active - pack it in</option>
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
