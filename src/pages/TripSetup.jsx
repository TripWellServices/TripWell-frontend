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
  const [joinCode, setJoinCode] = useState("");
  const [codeStatus, setCodeStatus] = useState(null);
  const [codeValid, setCodeValid] = useState(false);
  const [partyCount, setPartyCount] = useState("");
  const [whoWith, setWhoWith] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const WHO_OPTIONS = [
    { label: "Spouse / Partner", value: "spouse" },
    { label: "Kids", value: "kids" },
    { label: "Friends", value: "friends" },
    { label: "Parents / Elders", value: "parents" },
    { label: "Multigenerational", value: "multigen" },
    { label: "Solo", value: "solo" },
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
        tripName, purpose, city, joinCode,
        whoWith, // array
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
      
      const data = res.data.catch(() => ({}));
      console.log("create trip resp", res.status, data);

      if (res.status === 201 && data.tripId) {
        console.log("✅ Trip created successfully, starting TripExtra flow...");
        
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

        // 2. Wait 1000ms as requested
        console.log("⏳ Waiting 1000ms before TripExtra validation...");
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 3. Call TripExtra validation and get complete localStorage data
        try {
          console.log("🔍 Calling TripExtra validation...");
          const hydrateRes = await axios.get(`${BACKEND_URL}/tripwell/hydrate`, {
            headers: authConfig.headers,
            cache: "no-store"
          });
          
          if (hydrateRes.status === 200) {
            const hydrateData = hydrateRes.data;
            console.log("✅ TripExtra validation complete:", hydrateData.validation?.summary);
            
            // 4. Update localStorage with validated data
            if (hydrateData.userData) {
              localStorage.setItem("userData", JSON.stringify(hydrateData.userData));
            }
            if (hydrateData.tripData) {
              localStorage.setItem("tripData", JSON.stringify(hydrateData.tripData));
            }
            if (hydrateData.tripIntentData) {
              localStorage.setItem("tripIntentData", JSON.stringify(hydrateData.tripIntentData));
            }
                    if (hydrateData.anchorLogicData) {
          localStorage.setItem("anchorLogic", JSON.stringify(hydrateData.anchorLogicData));
            }
            if (hydrateData.itineraryData) {
              localStorage.setItem("itineraryData", JSON.stringify(hydrateData.itineraryData));
            }
            
            console.log("💾 Updated localStorage with TripExtra validated data");
          } else {
            console.warn("⚠️ TripExtra validation failed, continuing with basic data");
          }
        } catch (err) {
          console.warn("⚠️ TripExtra validation error:", err.message);
          // Continue anyway - basic data is already saved
        }
        
        // 5. Navigate to trip created page
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
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Set Up Your Trip</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          value={tripName}
          onChange={(e) => setTripName(e.target.value)}
          placeholder="Trip Name"
          className="w-full p-3 border rounded"
          required
        />
        <input
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="Purpose (e.g. Vacation)"
          className="w-full p-3 border rounded"
          required
        />
        <input
          type="date"
          value={startDate || ""}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full p-3 border rounded"
          required
        />
        <input
          type="date"
          value={endDate || ""}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full p-3 border rounded"
          required
        />
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City or Destination"
          className="w-full p-3 border rounded"
          required
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Trip Join Code
          </label>
                      <p className="text-xs text-gray-600 mb-2">
              Create a unique join code that you'll share with other participants. They'll use this code to join your trip planning. 
              Choose something memorable like "PARIS2025" or "BEACHWEEK" and make sure it's unique (minimum 3 characters).
            </p>
          <div className="flex items-center gap-2">
            <input
              value={joinCode}
              onChange={(e) => {
                setJoinCode(e.target.value);
                setCodeValid(false);
                setCodeStatus(null);
              }}
              placeholder="e.g., PARIS2025, BEACHWEEK, FAMILYTRIP"
              className="w-full p-3 border rounded"
              required
            />
            <button
              type="button"
              onClick={checkJoinCode}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Check Availability
            </button>
          </div>
          {codeStatus && (
            <div className={`text-sm p-2 rounded ${codeStatus.color === 'text-green-600' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {codeStatus.msg}
            </div>
          )}
          {!codeStatus && joinCode && (
            <p className="text-xs text-gray-500">
              Click "Check Availability" to verify your join code is unique and hasn't been taken by other users. 
              Join codes must be at least 3 characters long.
            </p>
          )}
        </div>

        <label className="font-semibold">Party Count</label>
        <input
          type="number"
          min={1}
          value={partyCount || ""}
          onChange={(e) => setPartyCount(e.target.value)}
          className="w-full p-3 border rounded"
          required
        />

        <fieldset className="space-y-2">
          <legend className="font-semibold">Who are you traveling with?</legend>
          {WHO_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={opt.value}
                checked={whoWith.includes(opt.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setWhoWith([...whoWith, opt.value]);
                  } else {
                    setWhoWith(whoWith.filter((w) => w !== opt.value));
                  }
                }}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </fieldset>

        <button
          type="submit"
          disabled={!codeValid || submitting}
          className={`
            w-full p-3 rounded font-semibold
            ${!codeValid || submitting 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }
          `}
        >
          {submitting ? 'Creating Trip...' : 'Create Trip'}
        </button>
      </form>
    </div>
  );
}