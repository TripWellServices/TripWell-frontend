import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuthConfig } from "../utils/auth";
import BACKEND_URL from "../config";

export default function TripSetup() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tripName, setTripName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [codeStatus, setCodeStatus] = useState(null);
  const [codeValid, setCodeValid] = useState(false);
  const [partyCount, setPartyCount] = useState("");
  const [whoWith, setWhoWith] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const WHO_OPTIONS = [
    { label: "Spouse / Partner", value: "spouse" },
    { label: "Spouse/Kids", value: "spouse-kids" },
    { label: "Son/Daughter", value: "son-daughter" },
    { label: "Friends", value: "friends" },
    { label: "Solo Traveler", value: "solo" },
    { label: "Other", value: "other" },
  ];

  useEffect(() => {
    // ✅ FIX: Just get user data from localStorage - no backend calls needed!
    const userData = JSON.parse(localStorage.getItem("userData") || "null");
    
    if (!userData?.firebaseId) {
      console.log("❌ No user data in localStorage, navigating to /access");
      navigate("/access");
      return;
    }
    
    console.log("✅ User data found in localStorage, showing trip setup form");
    setUser(userData);
    setLoading(false);
  }, [navigate]);

  const checkJoinCode = async () => {
    if (!joinCode || joinCode.trim().length < 3) {
      setCodeStatus({ msg: "⚠️ Please enter at least 3 characters.", color: "text-yellow-600" });
      setCodeValid(false);
      return;
    }

    try {
      const res = await axios.post(`${BACKEND_URL}/tripwell/joincodecheck`, {
        joinCode: joinCode.trim()
      });

      const data = res.data;
      if (res.status === 200 && data.available) {
        setCodeStatus({ msg: "✅ Code is available!", color: "text-green-600" });
        setCodeValid(true);
      } else {
        setCodeStatus({ msg: "❌ Code already taken.", color: "text-red-600" });
        setCodeValid(false);
      }
    } catch (err) {
      console.error("Error checking code:", err);
      setCodeStatus({ msg: "⚠️ Error checking code.", color: "text-yellow-600" });
      setCodeValid(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (submitting) return;
    if (!codeValid) {
      alert("Please pick a valid, available join code before creating your trip.");
      return;
    }

    // Validate partyCount
    if (!partyCount || isNaN(Number(partyCount)) || Number(partyCount) < 1) {
      alert("Please enter a valid party count (minimum 1).");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        tripName, purpose, city, country, joinCode,
        whoWith, // single string
        startDate, endDate,                 // "YYYY-MM-DD" strings
        partyCount: partyCount ? Number(partyCount) : null,
      };

      // ✅ FIX: Use standardized auth utility
      const authConfig = await getAuthConfig();
      const res = await axios.post(`${BACKEND_URL}/tripwell/trip-setup`, payload, {
        headers: { 
          "Content-Type": "application/json",
          ...authConfig.headers
        },
      });
      
      const data = res.data;
      console.log("create trip resp", res.status, data);

      if (res.status === 201 && data.tripId) {
        console.log("✅ Trip created successfully, saving to localStorage...");
        
        // 1. Save basic data to localStorage immediately
        const userData = {
          firebaseId: user.firebaseId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          hometownCity: user.hometownCity,
          state: user.state
        };
        
        const tripData = {
          tripId: data.tripId,
          tripName: tripName,
          purpose: purpose,
          startDate: startDate,
          endDate: endDate,
          city: city,
          joinCode: joinCode,
          whoWith: whoWith,
          partyCount: Number(partyCount),
          startedTrip: false,
          tripComplete: false
        };
        
        localStorage.setItem("userData", JSON.stringify(userData));
        localStorage.setItem("tripData", JSON.stringify(tripData));
        console.log("💾 Saved basic userData and tripData to localStorage");

        // 2. Navigate to trip created page (dual save complete)
        // LocalUniversalRouter will handle hydration when needed
        console.log("🚀 Navigating to /tripcreated");
        navigate(`/tripcreated`);
      } else if (res.status === 409) {
        // Show user-visible error for conflicts
        alert(data.error || "Join code taken or user already has a trip");
      } else {
        alert(data.error || `Create failed (${res.status})`);
      }
    } catch (err) {
      console.error("❌ Trip creation failed:", err);
      // ✅ FIX: Add proper error handling
      if (err.response?.status === 401) {
        alert("Authentication error. Please sign in again.");
        navigate("/access");
      } else if (err.response?.status === 409) {
        alert("Join code already taken. Please try a different code.");
      } else {
        alert("Failed to create trip. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-600 text-lg">We're getting your trip set up ready.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-300 to-blue-200 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
        {/* Header Section */}
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L12 21L16 22V20.5L14 19V13.5L22 16Z"/>
            </svg>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Lock in Your Trip Details!
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              This is the literal start of your adventure! Give your trip a fun name, define its purpose, and share the details. 
              <span className="font-semibold text-blue-700"> The more details you provide, the more your AI trip planner will help craft the perfect experience.</span>
            </p>
          </div>
        </div>

        {/* Trip Creation Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Trip Name</label>
              <input
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                placeholder="Paris Adventure, Beach Getaway, Family Reunion"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Purpose</label>
              <input
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Anniversary, Birthday, Relaxation"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={startDate || ""}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={endDate || ""}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Paris"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">State/Country</label>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="France"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Trip Join Code
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Create a unique join code that you'll share with friends! They'll use this to join your trip planning. 
              Choose something memorable like "PARIS2025" or "BEACHWEEK" (minimum 3 characters).
            </p>
            <div className="flex items-center gap-3">
              <input
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value);
                  setCodeValid(false);
                  setCodeStatus(null);
                }}
                placeholder="PARIS2025, BEACHWEEK, FAMILYTRIP"
                className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={checkJoinCode}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all font-medium"
              >
                Check Availability
              </button>
            </div>
            {codeStatus && (
              <div className={`text-sm p-3 rounded-xl ${codeStatus.color === 'text-green-600' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {codeStatus.msg}
              </div>
            )}
            {!codeStatus && joinCode && (
              <p className="text-sm text-gray-500">
                Click "Check" to verify your join code is unique and available.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Party Count</label>
            <input
              type="number"
              min={1}
              value={partyCount || ""}
              onChange={(e) => setPartyCount(e.target.value)}
              placeholder="How many people total?"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Who are you traveling with?</label>
            <div className="grid grid-cols-2 gap-3">
              {WHO_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer">
                  <input
                    type="radio"
                    name="whoWith"
                    value={opt.value}
                    checked={whoWith === opt.value}
                    onChange={(e) => setWhoWith(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!codeValid || submitting}
            className={`
              w-full p-4 rounded-xl font-semibold text-lg transition-all duration-200
              ${!codeValid || submitting 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5'
              }
            `}
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating Your Adventure...
              </div>
            ) : (
              '🎨 Create My Trip!'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}