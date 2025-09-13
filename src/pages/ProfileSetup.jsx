import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { getAuthConfig, getAuthToken } from "../utils/auth";
import { updateUserFunnelStage } from "../services/userService";
import BACKEND_URL from "../config";

export default function ProfileSetup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [hometownCity, setHometownCity] = useState("");
  const [state, setState] = useState("");
  const [planningVibe, setPlanningVibe] = useState("");
  const [travelVibe, setTravelVibe] = useState("");
  const [dreamDestination, setDreamDestination] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const fromDemo = location.state?.fromDemo || false;

  const states = [
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
    "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
    "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
    "VA","WA","WV","WI","WY"
  ];

  useEffect(() => {
    // No hydration needed - we know this is a new/incomplete user
    console.log("🔍 ProfileSetup: Setting up form for new/incomplete user");
    setEmail(auth.currentUser?.email || "");
    setLoading(false);
  }, []);

  const planningVibeOptions = [
    "Spontaneity",
    "Rigid", 
    "Like mix"
  ];

  const travelVibeOptions = [
    "Go with flow",
    "Spontaneity", 
    "Stick to schedule",
    "Want to just enjoy the moment"
  ];


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ FIX: Use standardized auth utility
      const authConfig = await getAuthConfig();
      const res = await fetch(`${BACKEND_URL}/tripwell/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authConfig.headers
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          hometownCity,
          state,
          planningVibe,
          travelVibe,
          dreamDestination
        })
      });

      if (!res.ok) throw new Error(`Profile update failed: ${res.status}`);

      // Save updated user data to localStorage
      const updatedUserData = {
        firebaseId: auth.currentUser.uid,
        email: email,
        firstName: firstName,
        lastName: lastName,
        hometownCity: hometownCity,
        state: state,
        profileComplete: true
      };
      localStorage.setItem("userData", JSON.stringify(updatedUserData));
      localStorage.setItem("profileComplete", "true");
      console.log("💾 Updated userData and set profileComplete to true:", updatedUserData);

      // ✅ Route to post profile complete after saving profile
      navigate("/postprofileroleselect");
    } catch (err) {
      console.error("Error submitting profile:", err);
      // ✅ FIX: Add proper error handling
      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        alert("Authentication error. Please sign in again.");
        navigate("/access");
      } else {
        alert("Failed to save profile. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-600 text-lg">Loading profile…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
        {/* Header with face icon */}
        <div className="text-center space-y-4 mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mx-auto flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Let's Get to Know You! 👋
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Tell us a bit about yourself so we can personalize your trip planning experience and suggest destinations you'll love.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="font-semibold text-gray-700">First Name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-gray-700">Last Name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="font-semibold text-gray-700">Email</label>
          <input value={email} disabled className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600" />
        </div>

        <div className="space-y-2">
          <label className="font-semibold text-gray-700">City/State You Call Home</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={hometownCity}
              onChange={(e) => setHometownCity(e.target.value)}
              placeholder="City"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            >
              <option value="">State</option>
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Planning Vibes</h3>
          <p className="text-gray-600 text-sm">How do you like to plan your trips?</p>
          <div className="space-y-3">
            {planningVibeOptions.map((vibe) => (
              <label key={vibe} className="flex items-center space-x-3 cursor-pointer p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all">
                <input
                  type="radio"
                  name="planningVibe"
                  value={vibe}
                  checked={planningVibe === vibe}
                  onChange={(e) => setPlanningVibe(e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 font-medium">{vibe}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Travel Vibes</h3>
          <p className="text-gray-600 text-sm">What's your travel style?</p>
          <div className="space-y-3">
            {travelVibeOptions.map((vibe) => (
              <label key={vibe} className="flex items-center space-x-3 cursor-pointer p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all">
                <input
                  type="radio"
                  name="travelVibe"
                  value={vibe}
                  checked={travelVibe === vibe}
                  onChange={(e) => setTravelVibe(e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 font-medium">{vibe}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">What's your dream destination?</h3>
          <p className="text-gray-600 text-sm">This helps us understand your travel style and interests</p>
          <input
            value={dreamDestination}
            onChange={(e) => setDreamDestination(e.target.value)}
            placeholder="Paris, Tokyo, Bali, New York, anywhere your heart desires..."
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
          />
        </div>

        <button
          type="submit"
          className="w-full p-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          🚀 Let's Go!
        </button>
      </form>
      </div>
    </div>
  );
}
