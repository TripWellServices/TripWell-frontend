// src/pages/LocalUniversalRouter.jsx
// 🎯 MINIMAL ROUTER - Hydrate data and route based on trip state
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import BACKEND_URL from "../config";

// Router state: "splash" | "hydrating" | "ready"

export default function LocalUniversalRouter() {
  const navigate = useNavigate();
  const [state, setState] = useState("splash");

  // Get auth config for API calls
  const getAuthConfig = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user found");
    
    const token = await user.getIdToken();
    return {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    };
  };

  // Hydrate data from backend
  const hydrate = async () => {
    try {
      setState("hydrating");
      console.log("🔄 Hydrating data...");
      
      const authConfig = await getAuthConfig();
      const response = await fetch(`${BACKEND_URL}/tripwell/hydrate`, {
        headers: authConfig.headers,
        cache: "no-store"
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log("❌ Auth error, routing to /access");
          navigate("/access");
          return;
        }
        if (response.status === 404) {
          console.log("❌ User not found, clearing cache and routing to /access");
          localStorage.clear();
          navigate("/access");
          return;
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Hydration complete:", data);

      // Save data to localStorage
      if (data.userData) {
        localStorage.setItem("userData", JSON.stringify(data.userData));
      }
      if (data.tripData) {
        localStorage.setItem("tripData", JSON.stringify(data.tripData));
      }
      if (data.tripPersonaData) {
        localStorage.setItem("tripPersonaData", JSON.stringify(data.tripPersonaData));
      }
      if (data.itineraryData) {
        localStorage.setItem("itineraryData", JSON.stringify(data.itineraryData));
      }
      if (data.selectedMetas) {
        localStorage.setItem("selectedMetas", JSON.stringify(data.selectedMetas));
      }
      if (data.selectedSamples) {
        localStorage.setItem("selectedSamples", JSON.stringify(data.selectedSamples));
      }

      setState("ready");
    } catch (error) {
      console.error("❌ Hydration failed:", error);
      navigate("/access");
    }
  };

  // Route based on trip state - use hydrated data
  const decideRoute = () => {
    // Get data from localStorage (already hydrated)
    const tripData = JSON.parse(localStorage.getItem("tripData") || "null");
    const tripPersonaData = JSON.parse(localStorage.getItem("tripPersonaData") || "null");
    const selectedMetas = JSON.parse(localStorage.getItem("selectedMetas") || "[]");
    const selectedSamples = JSON.parse(localStorage.getItem("selectedSamples") || "[]");
    const itineraryData = JSON.parse(localStorage.getItem("itineraryData") || "null");

    console.log("🔍 Routing decision tree:", {
      hasTripData: !!tripData,
      hasTripPersona: !!tripPersonaData,
      hasSelectedMetas: selectedMetas.length > 0,
      hasSelectedSamples: selectedSamples.length > 0,
      hasItinerary: !!itineraryData
    });

    // No trip data = need to create/join trip
    if (!tripData) {
      console.log("❌ No trip data → /postprofileroleselect");
      navigate("/postprofileroleselect");
      return;
    }

    // Trip is complete
    if (tripData.tripComplete === true) {
      console.log("✅ Trip complete → /tripcomplete");
      navigate("/tripcomplete");
      return;
    }

    // Trip has started
    if (tripData.startedTrip === true) {
      console.log("🚀 Trip started → /livedayreturner");
      navigate("/livedayreturner");
      return;
    }

    // No trip persona data
    if (!tripPersonaData) {
      console.log("❌ No trip persona → /trip-persona");
      navigate("/trip-persona");
      return;
    }

    // No meta selections
    if (selectedMetas.length === 0) {
      console.log("❌ No meta selections → /meta-select");
      navigate("/meta-select");
      return;
    }

    // No sample selections
    if (selectedSamples.length === 0) {
      console.log("❌ No sample selections → /sample-select");
      navigate("/sample-select");
      return;
    }

    // No itinerary data
    if (!itineraryData) {
      console.log("❌ No itinerary → /itinerarybuild");
      navigate("/itinerarybuild");
      return;
    }

    // Default: go to pre-trip hub
    console.log("✅ All data present → /pretriphub");
    navigate("/pretriphub");
  };

  // Initial hydration
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      hydrate();
    }, 800);

    return () => clearTimeout(timeoutId);
  }, []);

  // Splash screen
  if (state === "splash") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-300 to-blue-200 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="space-y-6">
            {/* TripWell Logo */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TripWell
              </h1>
            </div>
            
            {/* Loading Spinner */}
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Hydrating state
  if (state === "hydrating") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-300 to-blue-200 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-gray-600 text-lg">Loading your trip data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Ready state - show button
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-300 to-blue-200 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-6">
          {/* TripWell Logo */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              TripWell
            </h1>
            <p className="text-gray-600 text-lg">Ready to continue your adventure!</p>
          </div>
          
          {/* Continue Button */}
          <button
            onClick={decideRoute}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            🚀 Pick up where you left off!
          </button>
        </div>
      </div>
    </div>
  );
}