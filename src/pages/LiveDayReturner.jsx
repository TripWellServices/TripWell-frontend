import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../firebase";
import BACKEND_URL from "../config";

// Progressive navigation state management
const getCurrentState = () => {
  const dayIndex = parseInt(localStorage.getItem("currentDayIndex") || "1");
  const blockName = localStorage.getItem("currentBlockName") || "morning";
  return { dayIndex, blockName };
};

const setCurrentState = (dayIndex, blockName) => {
  localStorage.setItem("currentDayIndex", dayIndex.toString());
  localStorage.setItem("currentBlockName", blockName);
};

export default function LiveDayReturner() {
  console.log("🚀 LiveDayReturner component mounted");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hydrating, setHydrating] = useState(false);
  const [tripData, setTripData] = useState(null);
  const [backendState, setBackendState] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkTripStatus = async (user) => {
      try {
        // Get local trip data for the API call
        const localTripData = JSON.parse(localStorage.getItem("tripData") || "null");
        
        if (!localTripData?.tripId) {
          console.log("❌ No tripId found in localStorage");
          navigate("/");
          return;
        }

        // 🔴 SOURCE OF TRUTH: Hydrate from backend
        if (!user) {
          console.log("❌ No Firebase user");
          setError("Authentication required");
          setLoading(false);
          return;
        }

        const token = await user.getIdToken();
        const response = await axios.get(`${BACKEND_URL}/tripwell/livestatus/${localTripData.tripId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data) {
          // ✅ Backend hydration successful - this is our source of truth
          setBackendState(response.data);
          setTripData(localTripData);
          console.log("✅ Backend state loaded:", response.data);
        } else {
          throw new Error("No data from backend");
        }

        setLoading(false);
      } catch (error) {
        console.error("❌ Backend hydration failed:", error);
        setError(error.message || "Failed to load trip status");
        setLoading(false);
      }
    };

    // Wait for Firebase authentication to complete
    const unsubscribe = auth.onAuthStateChanged((user) => {
      checkTripStatus(user);
    });

    return unsubscribe;
  }, [navigate]);

  const handleTakeMeBack = async () => {
    if (!backendState) {
      console.error("❌ No backend state available");
      return;
    }

    setHydrating(true);
    
    try {
      // Use backend state as source of truth
      setCurrentState(backendState.currentDayIndex, backendState.currentBlock);
      console.log("✅ Set state from backend:", backendState);
      
      navigate("/tripliveday");
    } catch (error) {
      console.error("❌ Error taking back to live day:", error);
      setHydrating(false);
    }
  };

  const handlePickDay = () => {
    navigate("/pickliveday");
  };

  const handleStartOver = () => {
    // Clear localStorage and go home
    localStorage.clear();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading your trip status...</h2>
        </div>
      </div>
    );
  }

  if (error || !backendState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-3xl shadow-2xl text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">⚠️ Unable to Load Trip Status</h1>
          <p className="text-gray-600 mb-6">
            {error || "Failed to connect to the server. Please try again."}
          </p>
          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
            >
              🔄 Try Again
            </button>
            <button
              onClick={handleStartOver}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200"
            >
              🏠 Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-3xl shadow-2xl">
        <div className="text-center space-y-6">
          {/* Welcome Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-800">Welcome Back!</h1>
            <p className="text-lg text-gray-600">Ready to continue your adventure?</p>
          </div>

          {/* Trip Info */}
          {tripData && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 text-left">
              <h2 className="text-2xl font-semibold text-blue-600 mb-2">{tripData.tripName}</h2>
              <p className="text-gray-600 mb-2">📍 {tripData.city}</p>
              <p className="text-gray-600 mb-2">
                📅 {new Date(tripData.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - {new Date(tripData.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-gray-600">👥 {tripData.partyCount} travelers</p>
            </div>
          )}

          {/* Backend State - Source of Truth */}
          <div className="bg-green-50 rounded-2xl p-6 text-left">
            <h3 className="text-lg font-semibold text-green-800 mb-3">📍 Where you left off:</h3>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-medium">Day {backendState.currentDayIndex}</span> • {backendState.currentBlock.charAt(0).toUpperCase() + backendState.currentBlock.slice(1)}
              </p>
              <p className="text-sm text-green-600">✅ Synced with server</p>
              {backendState.tripComplete && (
                <p className="text-sm text-orange-600">🎉 Trip Complete!</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleTakeMeBack}
              disabled={hydrating}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {hydrating ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Loading...
                </span>
                             ) : (
                 "🚀 Take Me Where I Left Off"
               )}
            </button>

            <button
              onClick={handlePickDay}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 font-semibold text-lg"
            >
              🧭 Pick a Different Day
            </button>

            <button
              onClick={handleStartOver}
              className="w-full bg-gray-100 text-gray-700 px-8 py-4 rounded-2xl hover:bg-gray-200 transition-all duration-200 font-semibold text-lg"
            >
              🏠 Start Over
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
