import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BACKEND_URL from "../config";

// Progressive navigation state management
const getCurrentState = () => {
  return {
    currentDayIndex: parseInt(localStorage.getItem("currentDayIndex") || "1"),
    currentBlockName: localStorage.getItem("currentBlockName") || "morning"
  };
};

const setCurrentState = (dayIndex, blockName) => {
  localStorage.setItem("currentDayIndex", dayIndex.toString());
  localStorage.setItem("currentBlockName", blockName);
};

export default function LiveTripHydrator() {
  const [loading, setLoading] = useState(true);
  const [hydrating, setHydrating] = useState(false);
  const [tripData, setTripData] = useState(null);
  const [itineraryData, setItineraryData] = useState(null);
  const [backendState, setBackendState] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkTripStatus = async () => {
      try {
        // Check if user has a started trip
        const localTripData = JSON.parse(localStorage.getItem("tripData") || "null");
        const localItineraryData = JSON.parse(localStorage.getItem("itineraryData") || "null");
        
        if (!localTripData?.tripId || !localItineraryData?.days) {
          console.log("No active trip found, redirecting to home");
          navigate("/");
          return;
        }

        setTripData(localTripData);
        setItineraryData(localItineraryData);

        // Try to get authoritative state from backend
        try {
          const res = await axios.get(`${BACKEND_URL}/tripwell/livestatus/${localTripData.tripId}`);
          setBackendState(res.data);
          console.log("✅ Backend state loaded:", res.data);
        } catch (err) {
          console.warn("⚠️ Backend hydration failed, using local state:", err);
          setBackendState(null);
        }

      } catch (err) {
        console.error("❌ Error checking trip status:", err);
        setError("Failed to load trip status");
      } finally {
        setLoading(false);
      }
    };

    checkTripStatus();
  }, [navigate]);

  const handleTakeMeBack = async () => {
    setHydrating(true);
    try {
      if (backendState) {
        // Use backend authoritative state
        setCurrentState(backendState.currentDayIndex, backendState.currentBlock);
        console.log("🔄 Restored from backend state:", backendState);
      } else {
        // Use local state
        const { currentDayIndex, currentBlockName } = getCurrentState();
        console.log("🔄 Using local state:", { currentDayIndex, currentBlockName });
      }
      
      navigate("/tripliveday");
    } catch (err) {
      console.error("❌ Error restoring trip state:", err);
      setError("Failed to restore trip state");
    } finally {
      setHydrating(false);
    }
  };

  const handlePickDay = () => {
    navigate("/tripdaysoverview");
  };

  const handleStartOver = () => {
    // Clear trip state and go home
    localStorage.removeItem("tripData");
    localStorage.removeItem("itineraryData");
    localStorage.removeItem("currentDayIndex");
    localStorage.removeItem("currentBlockName");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading your trip...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-4xl">⚠️</div>
          <h2 className="text-xl font-semibold text-red-700">{error}</h2>
          <button 
            onClick={() => navigate("/")}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-800">Welcome Back!</h1>
            <p className="text-gray-600">
              We found your trip to <span className="font-semibold">{tripData.city}</span>
            </p>
          </div>

          {/* Trip Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Trip:</span> {tripData.tripName}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Days:</span> {itineraryData.days.length} total
            </p>
            {backendState && (
              <p className="text-sm text-green-600">
                <span className="font-medium">Last saved:</span> Day {backendState.currentDayIndex}, {backendState.currentBlock}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleTakeMeBack}
              disabled={hydrating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {hydrating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Take Me Back!</span>
                </>
              )}
            </button>

            <button
              onClick={handlePickDay}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>📋</span>
              <span>Pick a Day</span>
            </button>

            <button
              onClick={handleStartOver}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors text-sm"
            >
              Start Over
            </button>
          </div>

          {/* Status Info */}
          {backendState ? (
            <p className="text-xs text-green-600">
              ✅ Backend sync available
            </p>
          ) : (
            <p className="text-xs text-yellow-600">
              ⚠️ Using local state (offline mode)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
