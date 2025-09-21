import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { getAuthConfig } from "../utils/auth";
import BACKEND_URL from "../config";

export default function EditProfile() {
  const [persona, setPersona] = useState("");
  const [planningStyle, setPlanningStyle] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const personaOptions = [
    "Art",
    "Food", 
    "History",
    "Adventure"
  ];

  const planningStyleOptions = [
    "Spontaneity",
    "Flow", 
    "Rigid"
  ];

  useEffect(() => {
    // Load current user data
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    setPersona(userData.persona || "");
    setPlanningStyle(userData.planningStyle || "");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const authConfig = await getAuthConfig();
      const res = await fetch(`${BACKEND_URL}/tripwell/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authConfig.headers
        },
        body: JSON.stringify({
          persona,
          planningStyle
        })
      });

      if (!res.ok) throw new Error(`Profile update failed: ${res.status}`);

      // Update localStorage
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      userData.persona = persona;
      userData.planningStyle = planningStyle;
      localStorage.setItem("userData", JSON.stringify(userData));

      alert("Profile updated successfully!");
      navigate("/localrouter");
      
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-300 to-blue-200 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Edit Your Profile
          </h1>
          <p className="text-gray-600 text-lg">
            Update your persona and planning preferences
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">How do you best describe your trip desires?</h3>
            <p className="text-gray-600 text-sm">What type of experiences do you enjoy most?</p>
            <div className="space-y-3">
              {personaOptions.map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all">
                  <input
                    type="radio"
                    name="persona"
                    value={option}
                    checked={persona === option}
                    onChange={(e) => setPersona(e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 font-medium">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">How do you plan/live out your trips?</h3>
            <p className="text-gray-600 text-sm">What's your planning and travel style?</p>
            <div className="space-y-3">
              {planningStyleOptions.map((style) => (
                <label key={style} className="flex items-center space-x-3 cursor-pointer p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all">
                  <input
                    type="radio"
                    name="planningStyle"
                    value={style}
                    checked={planningStyle === style}
                    onChange={(e) => setPlanningStyle(e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 font-medium">{style}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate("/localrouter")}
              className="flex-1 p-4 rounded-xl font-semibold text-lg bg-gray-300 text-gray-800 hover:bg-gray-400 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !persona || !planningStyle}
              className="flex-1 p-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
