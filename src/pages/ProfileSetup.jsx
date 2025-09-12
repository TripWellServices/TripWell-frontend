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
  const [budgetTime, setBudgetTime] = useState("");
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
    const hydrateForm = async () => {
      try {
        // ✅ FIX: Use standardized auth utility
        const authConfig = await getAuthConfig();
        const res = await fetch(`${BACKEND_URL}/tripwell/whoami`, {
          headers: authConfig.headers,
          cache: "no-store"
        });

        if (!res.ok) throw new Error(`Hydration failed: ${res.status}`);
        const { user } = await res.json();

        setFirstName(user?.firstName || "");
        setLastName(user?.lastName || "");
        setEmail(user?.email || auth.currentUser?.email || "");
        setHometownCity(user?.hometownCity || "");
        setState(user?.state || "");
        setBudgetTime(user?.budgetTime || "");
        setDreamDestination(user?.dreamDestination || "");
      } catch (err) {
        console.error("Error hydrating user:", err);
        // ✅ FIX: Add proper error handling
        if (err.message.includes("401") || err.message.includes("Unauthorized")) {
          alert("Authentication error. Please sign in again.");
          navigate("/access");
          return;
        }
        setEmail(auth.currentUser?.email || ""); // fallback
      } finally {
        setLoading(false);
      }
    };

    hydrateForm();
  }, [navigate]);

  const budgetTimeOptions = [
    { value: "money-no-time", label: "💰 I have more money but no time", emoji: "⏰" },
    { value: "time-no-money", label: "⏰ I have time but no money", emoji: "💸" },
    { value: "money-and-time", label: "🎉 I have both money AND time!", emoji: "🚀" }
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
          budgetTime,
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
            Your profile helps us know you as you travel, so we can create the perfect trip experience just for you.
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
          <h3 className="text-lg font-semibold text-gray-800">Would you say...</h3>
          <div className="space-y-3">
            {budgetTimeOptions.map((option) => (
              <label key={option.value} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
                <input
                  type="radio"
                  name="budgetTime"
                  value={option.value}
                  checked={budgetTime === option.value}
                  onChange={(e) => setBudgetTime(e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-lg">{option.emoji}</span>
                <span className="text-gray-700 font-medium">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">If you could go anywhere in the world, where would it be?</h3>
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
