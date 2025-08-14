// src/pages/TripIntentForm.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import BACKEND_URL from "../config";
import { fetchJSON } from "../utils/fetchJSON";

// Predefined options for each category
const PRIORITIES_OPTIONS = [
  "Cultural experiences",
  "Food & dining",
  "Adventure & outdoor",
  "Relaxation & wellness",
  "Shopping & markets",
  "Historical sites",
  "Local experiences",
  "Photography",
  "Nightlife",
  "Family activities"
];

const VIBES_OPTIONS = [
  "Romantic",
  "Adventurous",
  "Relaxed",
  "Cultural",
  "Luxury",
  "Budget-friendly",
  "Social",
  "Solo exploration",
  "Family-friendly",
  "Party atmosphere"
];

const MOBILITY_OPTIONS = [
  "Walking",
  "Public transit",
  "Rental car",
  "Taxis/rideshares",
  "Bicycle",
  "Boat/ferry",
  "Limited mobility friendly"
];

const TRAVEL_PACE_OPTIONS = [
  "Slow & relaxed",
  "Moderate pace",
  "Fast-paced",
  "Full days",
  "Half days",
  "Flexible schedule"
];

const BUDGET_OPTIONS = [
  "Budget ($)",
  "Moderate ($$)",
  "Luxury ($$$)",
  "Ultra-luxury ($$$$)"
];

export default function TripIntentForm() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Use arrays for checkbox selections
  const [priorities, setPriorities] = useState([]);
  const [vibes, setVibes] = useState([]);
  const [mobility, setMobility] = useState([]);
  const [travelPace, setTravelPace] = useState([]);
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

  // Helper function to handle checkbox changes
  const handleCheckboxChange = (category, value, checked) => {
    const setterMap = {
      priorities: setPriorities,
      vibes: setVibes,
      mobility: setMobility,
      travelPace: setTravelPace
    };

    const setter = setterMap[category];
    if (setter) {
      setter(prev => {
        if (checked) {
          return [...prev, value];
        } else {
          return prev.filter(item => item !== value);
        }
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await auth.currentUser.getIdToken();

      await fetchJSON(`${BACKEND_URL}/tripwell/intent`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          tripId: user.tripId,
          priorities: priorities.join(','),
          vibes: vibes.join(','),
          mobility: mobility.join(','),
          travelPace: travelPace.join(','),
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
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        🧠 What Kind of Trip is This?
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Priorities Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            🎯 What are your top priorities for this trip?
          </h2>
          <p className="text-gray-600 mb-4">Select all that apply:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PRIORITIES_OPTIONS.map((option) => (
              <label key={option} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={priorities.includes(option)}
                  onChange={(e) => handleCheckboxChange('priorities', option, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Vibes Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            🌟 What's the vibe you're going for?
          </h2>
          <p className="text-gray-600 mb-4">Select all that apply:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {VIBES_OPTIONS.map((option) => (
              <label key={option} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vibes.includes(option)}
                  onChange={(e) => handleCheckboxChange('vibes', option, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Mobility Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            🚶 How do you prefer to get around?
          </h2>
          <p className="text-gray-600 mb-4">Select all that apply:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MOBILITY_OPTIONS.map((option) => (
              <label key={option} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mobility.includes(option)}
                  onChange={(e) => handleCheckboxChange('mobility', option, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Travel Pace Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            ⏱️ What's your preferred travel pace?
          </h2>
          <p className="text-gray-600 mb-4">Select all that apply:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TRAVEL_PACE_OPTIONS.map((option) => (
              <label key={option} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={travelPace.includes(option)}
                  onChange={(e) => handleCheckboxChange('travelPace', option, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Budget Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            💰 What's your budget range?
          </h2>
          <p className="text-gray-600 mb-4">Select one:</p>
          <div className="space-y-3">
            {BUDGET_OPTIONS.map((option) => (
              <label key={option} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="budget"
                  value={option}
                  checked={budget === option}
                  onChange={(e) => setBudget(e.target.value)}
                  className="border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition text-lg font-semibold"
        >
          Save Trip Intent
        </button>
      </form>
    </div>
  );
}
