// src/pages/TripIntentForm.jsx - localStorage-first version
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BACKEND_URL from "../config";

export default function TripIntentForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [tripData, setTripData] = useState(null);
  const [formData, setFormData] = useState({
    priorities: [],
    vibes: [],
    mobility: [],
    travelPace: [],
    budget: ""
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const loadLocalData = () => {
      try {
        const user = JSON.parse(localStorage.getItem("userData") || "null");
        const trip = JSON.parse(localStorage.getItem("tripData") || "null");
        
        setUserData(user);
        setTripData(trip);
        
        console.log("🔍 Loaded localStorage data:", { user, trip });
      } catch (err) {
        console.error("❌ Error loading localStorage data:", err);
      }
    };

    loadLocalData();
  }, []);

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

  const mobilityOptions = [
    "Fully Mobile - Love walking everywhere",
    "Moderately Mobile - Mix of walking and transport",
    "Limited Mobility - Prefer transport options",
    "Wheelchair Accessible - Need accessible routes",
    "Stroller Friendly - Traveling with young kids"
  ];

  const travelPaceOptions = [
    "Fast Paced - Pack it all in",
    "Moderate - Balanced activities and rest",
    "Slow & Relaxed - Take time to soak it in",
    "Flexible - Go with the flow",
    "Structured - Like to have a plan"
  ];

  const togglePriority = (priority) => {
    setFormData(prev => 
      prev.priorities.includes(priority) 
        ? { ...prev, priorities: prev.priorities.filter(p => p !== priority) }
        : { ...prev, priorities: [...prev.priorities, priority] }
    );
  };

  const toggleVibe = (vibe) => {
    setFormData(prev => 
      prev.vibes.includes(vibe) 
        ? { ...prev, vibes: prev.vibes.filter(v => v !== vibe) }
        : { ...prev, vibes: [...prev.vibes, vibe] }
    );
  };

  const toggleMobility = (mobilityOption) => {
    setFormData(prev => 
      prev.mobility.includes(mobilityOption) 
        ? { ...prev, mobility: prev.mobility.filter(m => m !== mobilityOption) }
        : { ...prev, mobility: [...prev.mobility, mobilityOption] }
    );
  };

  const toggleTravelPace = (paceOption) => {
    setFormData(prev => 
      prev.travelPace.includes(paceOption) 
        ? { ...prev, travelPace: prev.travelPace.filter(p => p !== paceOption) }
        : { ...prev, travelPace: [...prev.travelPace, paceOption] }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${BACKEND_URL}/tripwell/tripintent`, {
        tripId: tripData.tripId || tripData._id,
        userId: userData.firebaseId,
        ...formData
      });

      if (res.status === 200) {
        // Save to localStorage
        localStorage.setItem("tripIntentData", JSON.stringify(formData));
        console.log("💾 Saved tripIntentData to localStorage:", formData);
        
        // Navigate to next step
        navigate("/anchorselect");
      } else {
        console.error("❌ Submit failed:", res.status);
      }
    } catch (err) {
      console.error("❌ Submit failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Check if form has any input
  const hasInput = formData.priorities.length > 0 || formData.vibes.length > 0 || formData.mobility.length > 0 || formData.travelPace.length > 0;

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
                  checked={formData.priorities.includes(option)}
                  onChange={() => togglePriority(option)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
          {formData.priorities.length === 0 && (
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
                  checked={formData.vibes.includes(option)}
                  onChange={() => toggleVibe(option)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
          {formData.vibes.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">Select at least one vibe</p>
          )}
        </div>

        {/* Mobility Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            🚶‍♂️ How mobile are you?
          </h2>
          <p className="text-gray-600 mb-4">
            This helps us plan activities that work for your mobility needs
          </p>
          <div className="grid grid-cols-1 gap-3">
            {mobilityOptions.map((option) => (
              <label key={option} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={formData.mobility.includes(option)}
                  onChange={() => toggleMobility(option)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
          {formData.mobility.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">Select your mobility preference</p>
          )}
        </div>

        {/* Travel Pace Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            ⏱️ What's your travel pace?
          </h2>
          <p className="text-gray-600 mb-4">
            How do you like to experience your trips?
          </p>
          <div className="grid grid-cols-1 gap-3">
            {travelPaceOptions.map((option) => (
              <label key={option} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={formData.travelPace.includes(option)}
                  onChange={() => toggleTravelPace(option)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
          {formData.travelPace.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">Select your travel pace</p>
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
            value={formData.budget}
            onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
            placeholder="e.g., $500-1000, Budget-friendly, Luxury"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={!hasInput || loading}
          className={`w-full py-4 px-6 rounded-lg transition text-lg font-semibold ${
            hasInput && !loading
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? "Saving..." : (hasInput ? 'Save Trip Intent' : 'Please fill in something first')}
        </button>

      </form>
    </div>
  );
}
