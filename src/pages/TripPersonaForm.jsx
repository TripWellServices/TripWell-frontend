// src/pages/TripPersonaBuild.jsx - NEW PERSONA SYSTEM
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BACKEND_URL from "../config";

export default function TripPersonaForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [tripData, setTripData] = useState(null);
  const [formData, setFormData] = useState({
    primaryPersona: "", // art, foodie, adventure, history
    budget: "", // low, moderate, high
    whoWith: "", // solo, couple, family, friends
    romanceLevel: 0.0, // 0.0 to 1.0
    caretakerRole: 0.0, // 0.0 to 1.0
    flexibility: 0.5 // 0.5 balanced/go with flow, 0.0 rigid, 1.0 spontaneous
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
        console.log("🔍 Trip data details:", {
          city: trip?.city,
          fullTripData: trip
        });
      } catch (err) {
        console.error("❌ Error loading localStorage data:", err);
      }
    };

    loadLocalData();
  }, []);

  // 4 Persona Options (from TripGPTPersonaMatch.md)
  const personaOptions = [
    { key: "art", label: "Art & Culture", emoji: "🎨", description: "Museums, galleries, cultural experiences" },
    { key: "foodie", label: "Food & Dining", emoji: "🍽️", description: "Restaurants, food tours, culinary experiences" },
    { key: "adventure", label: "Adventure & Outdoor", emoji: "🏔️", description: "Hiking, outdoor activities, adventure sports" },
    { key: "history", label: "History & Heritage", emoji: "🏛️", description: "Historical sites, cultural heritage, monuments" }
  ];

  // Budget Options (from TripGPTPersonaMatch.md)
  const budgetOptions = [
    { key: "low", label: "Low", emoji: "💰", description: "$50-100/day", value: 0.3 },
    { key: "moderate", label: "Moderate", emoji: "💳", description: "$100-200/day", value: 0.5 },
    { key: "high", label: "High", emoji: "💎", description: "$200+/day", value: 1.0 }
  ];

  // Who With Options
  const whoWithOptions = [
    { key: "solo", label: "Solo", emoji: "🧳", description: "Traveling alone" },
    { key: "couple", label: "Couple", emoji: "💕", description: "Romantic getaway" },
    { key: "family", label: "Family", emoji: "👨‍👩‍👧‍👦", description: "Family trip" },
    { key: "friends", label: "Friends", emoji: "👥", description: "Friends trip" }
  ];

  // Selection functions
  const selectPrimaryPersona = (personaKey) => {
    setFormData(prev => ({ ...prev, primaryPersona: personaKey }));
  };

  const selectBudget = (budgetKey) => {
    setFormData(prev => ({ ...prev, budget: budgetKey }));
  };

  const selectWhoWith = (whoWithKey) => {
    setFormData(prev => ({ ...prev, whoWith: whoWithKey }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send to backend to create TripPersona document
      const res = await axios.post(`${BACKEND_URL}/tripwell/trip-persona`, {
        tripId: tripData.tripId || tripData._id,
        userId: userData.firebaseId,
        primaryPersona: formData.primaryPersona,
        budget: formData.budget,
        whoWith: formData.whoWith,
        romanceLevel: formData.romanceLevel,
        caretakerRole: formData.caretakerRole,
        flexibility: formData.flexibility
      });

      if (res.status === 200) {
        // Save to localStorage as tripPersonaData (NEW FLOW)
        localStorage.setItem("tripPersonaData", JSON.stringify(res.data.persona));
        console.log("💾 Saved tripPersonaData to localStorage:", res.data.persona);
        
        // Navigate to meta selection (new flow)
        navigate("/meta-select");
      } else {
        console.error("❌ Submit failed:", res.status);
      }
      
    } catch (err) {
      console.error("❌ Submit failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Check if form has required input
  const hasInput = formData.primaryPersona !== "" && formData.budget !== "" && formData.whoWith !== "";

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
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-300 to-blue-200 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Build Your Travel Persona for <strong>{tripData?.city || "Your Destination"}</strong>
        </h1>
        
        <div className="bg-blue-50 p-6 rounded-xl mb-6 border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">Hi! Let's build your travel persona...</h2>
          <p className="text-blue-700 leading-relaxed">
            These simple questions will help Angela understand your travel style and create the perfect personalized itinerary for your trip to <strong>{tripData?.city || "your destination"}</strong>.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Primary Persona Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              🎯 What interests you most?
            </h2>
            <p className="text-gray-600 mb-4">
              Angela will focus on this area when planning your itinerary
            </p>
            <div className="grid grid-cols-1 gap-3">
              {personaOptions.map((option) => (
                <label key={option.key} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="primaryPersona"
                    checked={formData.primaryPersona === option.key}
                    onChange={() => selectPrimaryPersona(option.key)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-2xl">{option.emoji}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-700">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Budget Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              💰 What's your daily budget?
            </h2>
            <p className="text-gray-600 mb-4">
              This helps Angela suggest experiences that fit your budget
            </p>
            <div className="grid grid-cols-1 gap-3">
              {budgetOptions.map((option) => (
                <label key={option.key} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="budget"
                    checked={formData.budget === option.key}
                    onChange={() => selectBudget(option.key)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-2xl">{option.emoji}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-700">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Who With Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              👥 Who are you traveling with?
            </h2>
            <p className="text-gray-600 mb-4">
              This helps Angela tailor the experience to your group
            </p>
            <div className="grid grid-cols-1 gap-3">
              {whoWithOptions.map((option) => (
                <label key={option.key} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="whoWith"
                    checked={formData.whoWith === option.key}
                    onChange={() => selectWhoWith(option.key)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-2xl">{option.emoji}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-700">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
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
            {loading ? "Building Persona..." : (hasInput ? 'Build My Travel Persona' : 'Please answer all questions')}
          </button>

        </form>
      </div>
    </div>
  );
}
