import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthConfig } from "../utils/auth";
import BACKEND_URL from "../config";

export default function TripReviewEdit() {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [tripPersonaData, setTripPersonaData] = useState(null);
  const [selectedMetas, setSelectedMetas] = useState([]);
  const [selectedSamples, setSelectedSamples] = useState([]);
  const navigate = useNavigate();

  // Form states for editing
  const [profilePersona, setProfilePersona] = useState("");
  const [profilePlanningStyle, setProfilePlanningStyle] = useState("");
  const [tripPersona, setTripPersona] = useState("");
  const [budget, setBudget] = useState("");
  const [whoWith, setWhoWith] = useState("");
  const [romanceLevel, setRomanceLevel] = useState(0.5);
  const [caretakerRole, setCaretakerRole] = useState(0.5);
  const [flexibility, setFlexibility] = useState(0.5);

  const personaOptions = ["Art", "Food", "History", "Adventure"];
  const planningStyleOptions = ["Spontaneity", "Flow", "Rigid"];
  const budgetOptions = ["Low", "Moderate", "High"];
  const whoWithOptions = ["Solo", "Couple", "Family", "Friends"];

  useEffect(() => {
    // Load all data from localStorage
    const user = JSON.parse(localStorage.getItem("userData") || "{}");
    const tripPersona = JSON.parse(localStorage.getItem("tripPersonaData") || "{}");
    const metas = JSON.parse(localStorage.getItem("selectedMetas") || "[]");
    const samples = JSON.parse(localStorage.getItem("selectedSamples") || "[]");

    setUserData(user);
    setTripPersonaData(tripPersona);
    setSelectedMetas(metas);
    setSelectedSamples(samples);

    // Set form values
    setProfilePersona(user.persona || "");
    setProfilePlanningStyle(user.planningStyle || "");
    setTripPersona(tripPersona.persona || "");
    setBudget(tripPersona.budget || "");
    setWhoWith(tripPersona.whoWith || "");
    setRomanceLevel(tripPersona.romanceLevel || 0.5);
    setCaretakerRole(tripPersona.caretakerRole || 0.5);
    setFlexibility(tripPersona.flexibility || 0.5);
  }, []);

  const handleSaveAll = async () => {
    setLoading(true);
    try {
      // Update profile if changed
      if (profilePersona !== userData.persona || profilePlanningStyle !== userData.planningStyle) {
        const authConfig = await getAuthConfig();
        await fetch(`${BACKEND_URL}/tripwell/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...authConfig.headers
          },
          body: JSON.stringify({
            persona: profilePersona,
            planningStyle: profilePlanningStyle
          })
        });
      }

      // Update trip persona if changed
      if (tripPersona !== tripPersonaData.persona || budget !== tripPersonaData.budget) {
        const authConfig = await getAuthConfig();
        await fetch(`${BACKEND_URL}/tripwell/trip-persona`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authConfig.headers
          },
          body: JSON.stringify({
            persona: tripPersona,
            budget,
            whoWith,
            romanceLevel,
            caretakerRole,
            flexibility
          })
        });
      }

      // Update localStorage
      const updatedUserData = { ...userData, persona: profilePersona, planningStyle: profilePlanningStyle };
      const updatedTripPersona = { ...tripPersonaData, persona: tripPersona, budget, whoWith, romanceLevel, caretakerRole, flexibility };
      
      localStorage.setItem("userData", JSON.stringify(updatedUserData));
      localStorage.setItem("tripPersonaData", JSON.stringify(updatedTripPersona));

      alert("All changes saved successfully!");
      navigate("/tripwell/itinerarybuild");
      
    } catch (err) {
      console.error("Error saving changes:", err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-300 to-blue-200 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Review & Edit Your Preferences
            </h1>
            <p className="text-gray-600 text-lg">
              Make sure everything looks right before we build your itinerary
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Preferences */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Your Profile</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trip Desires</label>
                  <div className="space-y-2">
                    {personaOptions.map((option) => (
                      <label key={option} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="profilePersona"
                          value={option}
                          checked={profilePersona === option}
                          onChange={(e) => setProfilePersona(e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Planning Style</label>
                  <div className="space-y-2">
                    {planningStyleOptions.map((style) => (
                      <label key={style} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="profilePlanningStyle"
                          value={style}
                          checked={profilePlanningStyle === style}
                          onChange={(e) => setProfilePlanningStyle(e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">{style}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Preferences */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">This Trip</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trip Persona</label>
                  <div className="space-y-2">
                    {personaOptions.map((option) => (
                      <label key={option} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="tripPersona"
                          value={option}
                          checked={tripPersona === option}
                          onChange={(e) => setTripPersona(e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select budget</option>
                    {budgetOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Who With</label>
                  <select
                    value={whoWith}
                    onChange={(e) => setWhoWith(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select who you're traveling with</option>
                    {whoWithOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Items Display */}
          <div className="mt-8 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Your Selections</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">🚫 Attractions to Avoid ({selectedMetas.length})</h3>
                <div className="bg-red-50 p-3 rounded-lg">
                  {selectedMetas.length > 0 ? (
                    <ul className="text-sm space-y-1">
                      {selectedMetas.map((meta, index) => (
                        <li key={index} className="text-red-700">• {meta}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-red-600 text-sm">No attractions selected to avoid</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">✨ Sample Experiences ({selectedSamples.length})</h3>
                <div className="bg-green-50 p-3 rounded-lg">
                  {selectedSamples.length > 0 ? (
                    <ul className="text-sm space-y-1">
                      {selectedSamples.map((sample, index) => (
                        <li key={index} className="text-green-700">• {sample}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-green-600 text-sm">No sample experiences selected</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex space-x-4">
            <button
              onClick={() => navigate("/localrouter")}
              className="flex-1 p-4 rounded-xl font-semibold text-lg bg-gray-300 text-gray-800 hover:bg-gray-400 transition-all duration-200"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleSaveAll}
              disabled={loading}
              className="flex-1 p-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save & Build Itinerary"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
