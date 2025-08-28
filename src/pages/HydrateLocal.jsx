import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { getAuthConfig } from "../utils/auth";
import BACKEND_URL from "../config";

export default function HydrateLocal() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState({
    step: "initializing",
    message: "Starting hydration...",
    hydratedModels: 0,
    totalModels: 5
  });
  const [error, setError] = useState(null);
  const [hydratedData, setHydratedData] = useState({});

  useEffect(() => {
    if (isLoading) {
      hydrateData();
    }
  }, []);

  const updateProgress = (step, message, hydratedCount = 0) => {
    setProgress({
      step,
      message,
      hydratedModels: hydratedCount,
      totalModels: 3
    });
  };

  const hydrateData = async () => {
    try {
      if (isLoading === false) {
        console.log("🔍 HydrateLocal - Already hydrated, skipping...");
        return;
      }
      
      setIsLoading(true);
      setError(null);
      updateProgress("auth", "Loading your trip details...");

      // ✅ FIX: Use standardized auth utility (same pattern as LocalUniversalRouter)
      const authConfig = await getAuthConfig();
      updateProgress("fetching", "Getting your personalized experience...");
      
      const response = await fetch(`${BACKEND_URL}/tripwell/hydrate`, {
        headers: authConfig.headers,
        cache: "no-store"
      });

      if (!response.ok) {
        console.log("❌ /hydrate failed:", response.status);
        if (response.status === 401) {
          console.log("❌ Authentication error, routing to /access");
          throw new Error("Authentication failed - please log in again");
        }
        throw new Error(`Server error: ${response.status}`);
      }

      updateProgress("processing", "Setting up your adventure...");
      const freshData = await response.json();
      
      // 🔍 DEBUG: Log what backend sent (following dev guide pattern)
      console.log("🔍 Backend sent userData:", freshData.userData);
      console.log("🔍 Backend sent tripData:", freshData.tripData);
      console.log("🔍 Backend sent tripIntentData:", freshData.tripIntentData);
      console.log("🔍 Backend sent anchorLogicData:", freshData.anchorLogicData);
      console.log("🔍 Backend sent itineraryData:", freshData.itineraryData);
      
      // Save data to localStorage
      if (freshData.userData) {
        localStorage.setItem("userData", JSON.stringify(freshData.userData));
      }
      
      if (freshData.tripData) {
        localStorage.setItem("tripData", JSON.stringify(freshData.tripData));
      }
      
      if (freshData.tripIntentData) {
        localStorage.setItem("tripIntentData", JSON.stringify(freshData.tripIntentData));
      }
      
      if (freshData.anchorLogicData) {
        localStorage.setItem("anchorLogic", JSON.stringify(freshData.anchorLogicData));
      }
      
      if (freshData.itineraryData) {
        localStorage.setItem("itineraryData", JSON.stringify(freshData.itineraryData));
      }

      // Get final state from localStorage
      const localStorageData = {
        userData: JSON.parse(localStorage.getItem("userData") || "null"),
        tripData: JSON.parse(localStorage.getItem("tripData") || "null"),
        tripIntentData: JSON.parse(localStorage.getItem("tripIntentData") || "null"),
        anchorLogic: JSON.parse(localStorage.getItem("anchorLogic") || "null"),
        itineraryData: JSON.parse(localStorage.getItem("itineraryData") || "null"),
        profileComplete: localStorage.getItem("profileComplete") === "true"
      };
      
      setHydratedData(localStorageData);
      updateProgress("complete", "Trip details complete!", 3);

      // ✅ Auto-navigate after a brief delay to show completion
      console.log("✅ Trip details complete, auto-navigating to /localrouter");
      setTimeout(() => {
        navigate("/localrouter");
      }, 1000);

    } catch (err) {
      console.error("❌ Hydration error:", err);
      setError(err.message);
      updateProgress("error", "Loading failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    hydrateData();
  };

  const handleLogout = async () => {
    localStorage.clear();
    await signOut(auth);
    navigate("/");
  };

  const getProgressColor = () => {
    if (error) return "bg-red-500";
    if (progress.step === "complete") return "bg-green-500";
    return "bg-blue-500";
  };

  const getStepIcon = (step) => {
    switch (step) {
      case "initializing": return "✈️";
      case "auth": return "🔍";
      case "fetching": return "📡";
      case "processing": return "⚡";
      case "saving": return "💾";
      case "complete": return "✅";
      case "error": return "😅";
      default: return "✈️";
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center border border-gray-100">
          <div className="text-6xl mb-4">😅</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <div className="space-y-3">
            <button 
              onClick={handleRetry}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={handleLogout}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          {/* Animated Plane */}
          <div className="relative mb-6">
            <div className="text-6xl animate-bounce">✈️</div>
            <div className="absolute -top-2 -right-2 text-2xl animate-pulse">🌍</div>
            <div className="absolute -bottom-2 -left-2 text-xl animate-ping">✨</div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Loading Your Adventure</h1>
          <p className="text-gray-600">Preparing your personalized trip experience</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${(progress.hydratedModels / progress.totalModels) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Current Step */}
        <div className="flex items-center justify-center mb-6">
          <span className="text-2xl mr-3">{getStepIcon(progress.step)}</span>
          <span className="text-lg font-medium text-gray-700">{progress.message}</span>
        </div>

        {/* Simple Success Message */}
        {progress.step === "complete" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center">
            <div className="text-2xl mb-2">✅</div>
            <h3 className="font-semibold text-green-800">Trip details complete!</h3>
            <p className="text-green-600 text-sm">Taking you to your adventure...</p>
          </div>
        )}
      </div>
    </div>
  );
}
