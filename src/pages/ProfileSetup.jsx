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
  const [persona, setPersona] = useState("");
  const [planningStyle, setPlanningStyle] = useState("");
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
    // 🚨 HYDRATION CHECK: In case user accidentally hit signup when they already have account
    const checkExistingProfile = async () => {
      try {
        const authToken = await getAuthToken();
        if (!authToken) {
          setEmail(auth.currentUser?.email || "");
          setLoading(false);
          return;
        }

        // Check if user already has profile data
        const response = await fetch(`${BACKEND_URL}/tripwell/hydrate`, {
          headers: getAuthConfig().headers
        });

        if (response.ok) {
          const data = await response.json();
          
          // If user already has profile data, prepopulate it
          if (data.userData && data.userData.firstName && data.userData.lastName) {
            console.log("🤦‍♂️ User already has profile - prepopulating for escape route");
            
            setFirstName(data.userData.firstName || "");
            setLastName(data.userData.lastName || "");
            setEmail(data.userData.email || "");
            setHometownCity(data.userData.hometownCity || "");
            setState(data.userData.homeState || "");
            setDreamDestination(data.userData.dreamDestination || "");
            
            // Show escape route message
            alert("Hey! You already have a profile. We've prepopulated it for you. You can:\n1. Hit 'Save Profile' to continue\n2. Or go back to home if you meant to sign in instead");
          } else {
            // New user - just set email
            setEmail(auth.currentUser?.email || "");
          }
        } else {
          // New user - just set email
          setEmail(auth.currentUser?.email || "");
        }
      } catch (error) {
        console.log("No existing profile found - continuing with new user flow");
        setEmail(auth.currentUser?.email || "");
      } finally {
        setLoading(false);
      }
    };

    checkExistingProfile();
  }, []);

  const personaOptions = [
    "Art",
    "Food", 
    "History",
    "Adventure"
  ];

  const planningStyleOptions = [
    "Spontaneous",
    "Mix of spontaneous and planned", 
    "Set a plan and stick to it!"
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
          persona,
          planningStyle,
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
      };
      localStorage.setItem("userData", JSON.stringify(updatedUserData));
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
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-300 to-blue-200 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
        {/* Header with face icon */}
        <div className="text-center space-y-4 mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mx-auto flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome to TripWell! 🌍
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Just tell us your name and we'll get you started on your next adventure!
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
                  required
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
                  required
                />
                <span className="text-gray-700 font-medium">{style}</span>
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
            required
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
