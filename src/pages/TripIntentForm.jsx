// src/pages/TripIntentForm.jsx - MINIMAL TEST VERSION
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import BACKEND_URL from "../config";
import { fetchJSON } from "../utils/fetchJSON";

// Minimal test options
const PRIORITIES_OPTIONS = [
  "Food & dining",
  "Historical sites", 
  "Adventure & outdoor"
];

const VIBES_OPTIONS = [
  "Romantic",
  "Budget-friendly",
  "Social"
];

export default function TripIntentForm() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Test arrays for checkbox selections
  const [priorities, setPriorities] = useState([]);
  const [vibes, setVibes] = useState([]);

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
          return;
        }

        const token = await firebaseUser.getIdToken();

        const userData = await fetchJSON(`${BACKEND_URL}/tripwell/whoami`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store"
        });

        console.log("🔍 User data:", userData);
        setUser(userData.user);
      } catch (err) {
        console.error("❌ Error hydrating user:", err);
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, [navigate]);

  // Helper function to handle checkbox changes
  const handleCheckboxChange = (category, value, checked) => {
    if (category === 'priorities') {
      setPriorities(prev => {
        if (checked) {
          return [...prev, value];
        } else {
          return prev.filter(item => item !== value);
        }
      });
    } else if (category === 'vibes') {
      setVibes(prev => {
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

      const payload = {
        priorities: priorities.join(','),
        vibes: vibes.join(','),
      };

      console.log("🔍 Current state:", { priorities, vibes });
      console.log("📤 Sending payload:", payload);

      await fetchJSON(`${BACKEND_URL}/tripwell/tripintent`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      alert("Saved!");
      console.log("✅ Trip intent saved successfully");
    } catch (err) {
      console.error("❌ Failed to save trip intent", err);
      alert("Could not save your intent. Try again.");
    }
  };

  // Check if form has any selections
  const hasSelections = priorities.length > 0 || vibes.length > 0;

  if (loading) return <div className="p-6">Loading your trip...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        🧪 TEST: Trip Intent Form
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Priorities Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            🎯 Priorities (TEST)
          </h2>
          <p className="text-gray-600 mb-4">
            Select all that apply: {priorities.length > 0 && <span className="text-blue-600 font-semibold">({priorities.length} selected)</span>}
          </p>
          <div className="space-y-3">
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
            🌟 Vibes (TEST)
          </h2>
          <p className="text-gray-600 mb-4">
            Select all that apply: {vibes.length > 0 && <span className="text-blue-600 font-semibold">({vibes.length} selected)</span>}
          </p>
          <div className="space-y-3">
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

        <button
          type="submit"
          disabled={!hasSelections}
          className={`w-full py-4 px-6 rounded-lg transition text-lg font-semibold ${
            hasSelections 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {hasSelections ? 'Save Test Intent' : 'Please make some selections first'}
        </button>

      </form>
    </div>
  );
}
