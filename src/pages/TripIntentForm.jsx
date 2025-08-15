// src/pages/TripIntentForm.jsx - localStorage-first version
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import BACKEND_URL from "../config";

export default function TripIntentForm() {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);

  // Get data from localStorage
  const userData = JSON.parse(localStorage.getItem("userData") || "null");
  const tripData = JSON.parse(localStorage.getItem("tripData") || "null");

  // Predefined options for better UX
  const priorityOptions = [
    "Adventure & Outdoor Activities",
    "Cultural Experiences & History",
    "Food & Culinary Adventures",
    "Relaxation & Wellness",
    "Shopping & Local Markets",
    "Nightlife & Entertainment",
    "Nature & Scenic Views",
    "Local Community & People"
  ];

  const vibeOptions = [
    "Adventurous & Energetic",
    "Relaxed & Chill",
    "Romantic & Intimate",
    "Social & Fun",
    "Luxurious & Upscale",
    "Authentic & Local",
    "Creative & Artistic",
    "Spiritual & Mindful"
  ];

  const [priorities, setPriorities] = useState([]);
  const [vibes, setVibes] = useState([]);
  const [budget, setBudget] = useState("");

  const togglePriority = (priority) => {
    setPriorities(prev => 
      prev.includes(priority) 
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  const toggleVibe = (vibe) => {
    setVibes(prev => 
      prev.includes(vibe) 
        ? prev.filter(v => v !== vibe)
        : [...prev, vibe]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (submitting) return;

    setSubmitting(true);

    try {
      const payload = {
        tripId: tripData.tripId,
        userId: userData.firebaseId,
        priorities: priorities.join(','),
        vibes: vibes.join(','),
        budget: budget
      };

      console.log("🔍 Current state:", { priorities, vibes, budget });
      console.log("📤 Sending payload:", payload);
      console.log("🔑 Trip tripId:", tripData.tripId);

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
        
        // Save to localStorage for test flow
        const tripIntentData = {
          tripIntentId: data.tripIntentId || "generated-id",
          priorities: priorities,
          vibes: vibes,
          budget: budget
        };
        localStorage.setItem("tripIntentData", JSON.stringify(tripIntentData));
        console.log("💾 Saved tripIntentData to localStorage:", tripIntentData);
        
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
  const hasInput = priorities.length > 0 || vibes.length > 0;

  // If no localStorage data, show error
  if (!userData || !tripData) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Missing Data</h1>
          <p className="text-gray-600">Please start from the beginning.</p>
          <button 
            onClick={() => navigate("/")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        🧠 What Kind of Trip is This?
      </h1>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <p className="text-sm text-blue-800">
          Planning: <strong>{tripData.tripName}</strong> to <strong>{tripData.city}</strong>
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Priorities Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            🎯 What are your top priorities for this trip?
          </h2>
          <p className="text-gray-600 mb-4">
            Check all that apply to your trip goals
          </p>
          <div className="grid grid-cols-1 gap-3">
            {priorityOptions.map((option) => (
              <label key={option} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={priorities.includes(option)}
                  onChange={() => togglePriority(option)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
          {priorities.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">Select at least one priority</p>
          )}
        </div>

        {/* Vibes Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            🌟 What's the vibe you're going for?
          </h2>
          <p className="text-gray-600 mb-4">
            Check all that match your desired trip energy
          </p>
          <div className="grid grid-cols-1 gap-3">
            {vibeOptions.map((option) => (
              <label key={option} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={vibes.includes(option)}
                  onChange={() => toggleVibe(option)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
          {vibes.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">Select at least one vibe</p>
          )}
        </div>

        {/* Budget Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            💰 What's your budget range?
          </h2>
          <p className="text-gray-600 mb-4">
            This helps us suggest experiences that fit your budget
          </p>
          <input
            type="text"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g., $500-1000, Budget-friendly, Luxury"
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
