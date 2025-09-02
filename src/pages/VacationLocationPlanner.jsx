// src/pages/VacationLocationPlanner.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import BACKEND_URL from "../config";

export default function VacationLocationPlanner() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    numDays: 7,
    vibes: [],
    whoWith: [],
    startingLocation: "",
    preferences: [],
    budget: "medium"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [recommendationsData, setRecommendationsData] = useState(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const travelVibes = [
    "Chill", "Adventure", "Party", "Culture", "Romance", 
    "Family-friendly", "Luxury", "Budget", "Wellness", "Foodie"
  ];

  const whoWithOptions = [
    "Solo", "Spouse", "Kids", "Friends", "Parents", "Multigen", "Other"
  ];

  const preferenceOptions = [
    "Exotic", "Tropical", "History", "Part of world never seen", 
    "Mountains", "Beach", "City", "Countryside", "Islands", "Desert"
  ];

  const budgetOptions = [
    { value: "low", label: "Budget-Friendly" },
    { value: "medium", label: "Mid-Range" },
    { value: "high", label: "Luxury" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (type, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.startingLocation) {
      alert("Please enter your starting location");
      return;
    }
    
    if (formData.vibes.length === 0) {
      alert("Please select at least one travel vibe");
      return;
    }
    
    if (formData.whoWith.length === 0) {
      alert("Please select who you're traveling with");
      return;
    }
    
    if (formData.preferences.length === 0) {
      alert("Please select at least one preference");
      return;
    }

    setIsLoading(true);
    setRecommendationsData(null);

    try {
      const response = await fetch(`${BACKEND_URL}/tripwell/demo/vacation-planner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Demo generation failed: ${response.status}`);
      }

      const data = await response.json();
      setRecommendationsData(data);
      setShowAuthPrompt(true);
    } catch (error) {
      console.error("Demo generation error:", error);
      alert("Failed to generate vacation recommendations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, result.user);
      
      // Save demo data with user info
      const saveResponse = await fetch(`${BACKEND_URL}/tripwell/demo/vacation-planner/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await result.user.getIdToken()}`
        },
        body: JSON.stringify({
          firebaseId: result.user.uid,
          email: result.user.email,
          ...formData,
          recommendationsData
        })
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save demo data");
      }

      // Navigate to funnel router
      navigate("/funnelrouter");
    } catch (error) {
      console.error("Authentication error:", error);
      alert("Authentication failed. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Where Should You Go?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tell us about your dream vacation and we'll recommend the perfect destinations 
            based on your preferences, travel style, and who you're traveling with.
          </p>
        </div>

        {!recommendationsData ? (
          /* Input Form */
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Number of Days */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  How many days is your vacation?
                </label>
                <select
                  name="numDays"
                  value={formData.numDays}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  {[3, 5, 7, 10, 14, 21, 30].map(days => (
                    <option key={days} value={days}>
                      {days} {days === 1 ? 'day' : 'days'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Starting Location */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  Where are you starting from?
                </label>
                <input
                  type="text"
                  name="startingLocation"
                  value={formData.startingLocation}
                  onChange={handleInputChange}
                  placeholder="e.g., New York, NY or London, UK"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Travel Vibes */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  What's your travel vibe? (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {travelVibes.map(vibe => (
                    <label key={vibe} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.vibes.includes(vibe)}
                        onChange={() => handleCheckboxChange('vibes', vibe)}
                        className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                      />
                      <span className="text-gray-700">{vibe}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Who You're Traveling With */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  Who are you traveling with? (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {whoWithOptions.map(option => (
                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.whoWith.includes(option)}
                        onChange={() => handleCheckboxChange('whoWith', option)}
                        className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Vacation Preferences */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  What type of vacation are you looking for? (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {preferenceOptions.map(pref => (
                    <label key={pref} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.preferences.includes(pref)}
                        onChange={() => handleCheckboxChange('preferences', pref)}
                        className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                      />
                      <span className="text-gray-700">{pref}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  What's your budget level?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {budgetOptions.map(option => (
                    <label key={option.value} className="flex items-center space-x-2 cursor-pointer p-3 border border-gray-200 rounded-lg hover:border-sky-300">
                      <input
                        type="radio"
                        name="budget"
                        value={option.value}
                        checked={formData.budget === option.value}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-sky-600 border-gray-300 focus:ring-sky-500"
                      />
                      <span className="text-gray-700 font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-sky-600 to-blue-600 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:from-sky-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Finding Your Perfect Destinations...' : 'Find My Perfect Destinations'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Results Display */
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Your Perfect Vacation Destinations
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {recommendationsData.summary}
              </p>
            </div>

            {/* Recommendations */}
            <div className="space-y-6 mb-8">
              {recommendationsData.recommendations.map((rec, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">{rec.destination}</h3>
                    <span className="bg-sky-100 text-sky-800 px-3 py-1 rounded-full text-sm font-medium">
                      Option {index + 1}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4 leading-relaxed">{rec.whyPerfect}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Best Time to Visit</h4>
                      <p className="text-gray-600">{rec.bestTimeToVisit}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Estimated Cost</h4>
                      <p className="text-gray-600">{rec.estimatedCost}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Travel Time</h4>
                      <p className="text-gray-600">{rec.travelTime}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Highlights</h4>
                      <ul className="text-gray-600">
                        {rec.highlights.map((highlight, i) => (
                          <li key={i} className="flex items-center">
                            <span className="text-sky-500 mr-2">•</span>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {rec.specialConsiderations && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="font-semibold text-amber-800 mb-2">Special Considerations</h4>
                      <p className="text-amber-700">{rec.specialConsiderations}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Auth Prompt */}
            {showAuthPrompt && (
              <div className="text-center bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-8 border border-sky-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Love These Recommendations?
                </h3>
                <p className="text-gray-600 mb-6">
                  Sign in to save your vacation plan and get access to our full trip planning tools!
                </p>
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isAuthenticating}
                  className="bg-white text-gray-900 py-3 px-6 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto space-x-2"
                >
                  {isAuthenticating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-sky-600 rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Back Button */}
        {recommendationsData && (
          <div className="text-center">
            <button
              onClick={() => {
                setRecommendationsData(null);
                setShowAuthPrompt(false);
              }}
              className="text-sky-600 hover:text-sky-800 font-medium"
            >
              ← Try Different Preferences
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
