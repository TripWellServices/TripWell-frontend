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
      totalModels: 5
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
      updateProgress("auth", "Checking authentication...");

      // ✅ FIX: Use standardized auth utility (same pattern as LocalUniversalRouter)
      const authConfig = await getAuthConfig();
      updateProgress("fetching", "Fetching data from server...");
      
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

      updateProgress("processing", "Processing data...");
      const freshData = await response.json();
      
      // 🔍 DEBUG: Log what backend sent (following dev guide pattern)
      console.log("🔍 Backend sent userData:", freshData.userData);
      console.log("🔍 Backend sent tripData:", freshData.tripData);
      console.log("🔍 Backend sent tripIntentData:", freshData.tripIntentData);
      console.log("🔍 Backend sent anchorLogicData:", freshData.anchorLogicData);
      console.log("🔍 Backend sent itineraryData:", freshData.itineraryData);
      
      // Save data to localStorage with progress updates (localStorage "SDK" pattern)
      let hydratedCount = 0;
      
      if (freshData.userData) {
        localStorage.setItem("userData", JSON.stringify(freshData.userData));
        hydratedCount++;
        updateProgress("saving", "Saving user data...", hydratedCount);
      }
      
      if (freshData.tripData) {
        localStorage.setItem("tripData", JSON.stringify(freshData.tripData));
        hydratedCount++;
        updateProgress("saving", "Saving trip data...", hydratedCount);
      }
      
      if (freshData.tripIntentData) {
        localStorage.setItem("tripIntentData", JSON.stringify(freshData.tripIntentData));
        hydratedCount++;
        updateProgress("saving", "Saving trip intent...", hydratedCount);
      }
      
      if (freshData.anchorLogicData) {
        localStorage.setItem("anchorLogic", JSON.stringify(freshData.anchorLogicData));
        hydratedCount++;
        updateProgress("saving", "Saving anchor logic...", hydratedCount);
      }
      
      if (freshData.itineraryData) {
        localStorage.setItem("itineraryData", JSON.stringify(freshData.itineraryData));
        hydratedCount++;
        updateProgress("saving", "Saving itinerary...", hydratedCount);
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
      updateProgress("complete", "Hydration complete!", hydratedCount);

      // ✅ Auto-navigate after a brief delay to show completion
      console.log("✅ Hydration complete, auto-navigating to /localrouter");
      setTimeout(() => {
        navigate("/localrouter");
      }, 1500);

    } catch (err) {
      console.error("❌ Hydration error:", err);
      setError(err.message);
      updateProgress("error", "Hydration failed");
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
      case "initializing": return "🔄";
      case "auth": return "🔐";
      case "fetching": return "📡";
      case "processing": return "⚙️";
      case "saving": return "💾";
      case "complete": return "✅";
      case "error": return "❌";
      default: return "🔄";
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Hydration Failed</h1>
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Loading Your Trip</h1>
          <p className="text-gray-600">Getting everything ready for your adventure</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{progress.message}</span>
            <span>{progress.hydratedModels}/{progress.totalModels}</span>
          </div>
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

        {/* Data Status */}
        {progress.step === "complete" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-800 mb-3">✅ Successfully Loaded:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>👤 User Profile</span>
                <span className={hydratedData.userData ? "text-green-600" : "text-red-600"}>
                  {hydratedData.userData ? "✅" : "❌"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>✈️ Trip Details</span>
                <span className={hydratedData.tripData ? "text-green-600" : "text-red-600"}>
                  {hydratedData.tripData ? "✅" : "❌"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>🎯 Trip Intent</span>
                <span className={hydratedData.tripIntentData ? "text-green-600" : "text-red-600"}>
                  {hydratedData.tripIntentData ? "✅" : "❌"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>⚓ Anchor Points</span>
                <span className={hydratedData.anchorLogic ? "text-green-600" : "text-red-600"}>
                  {hydratedData.anchorLogic ? "✅" : "❌"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>📅 Itinerary</span>
                <span className={hydratedData.itineraryData ? "text-green-600" : "text-red-600"}>
                  {hydratedData.itineraryData ? "✅" : "❌"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Manual Navigation (only show if not auto-navigating) */}
        {progress.step === "complete" && (
          <div className="space-y-3">
            <button 
              onClick={() => navigate("/localrouter")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Continue to Trip
            </button>
            <button 
              onClick={() => navigate("/dayindextest")}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Day Index Test
            </button>
            <button 
              onClick={hydrateData}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Refresh Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
