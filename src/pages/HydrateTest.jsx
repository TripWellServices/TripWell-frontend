import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import BACKEND_URL from "../config";

export default function HydrateTest() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Ready to test hydration");
  const [error, setError] = useState(null);
  const [localStorageData, setLocalStorageData] = useState(null);

  const handleHydrate = async () => {
    try {
      setStatus("🔐 Getting Firebase token...");
      
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        setError("No authenticated user found");
        return;
      }

      setStatus("💾 Calling /tripwell/hydrate...");
      
      const token = await firebaseUser.getIdToken(true);
      const hydrateRes = await fetch(`${BACKEND_URL}/tripwell/hydrate`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store"
      });
      
      console.log("Hydrate response status:", hydrateRes.status);
      
      if (!hydrateRes.ok) {
        const errorText = await hydrateRes.text();
        console.error("Hydrate error response:", errorText);
        throw new Error(`Hydrate failed: ${hydrateRes.status} - ${errorText}`);
      }
      
      const data = await hydrateRes.json();
      console.log("🔍 Hydrate response:", data);
      setLocalStorageData(data);

      setStatus("💾 Saving to localStorage...");

      // Save all data to localStorage
      if (data.userData) {
        localStorage.setItem("userData", JSON.stringify(data.userData));
        console.log("💾 Saved userData to localStorage:", data.userData);
        
        // Set profileComplete flag based on backend data
        if (data.userData.profileComplete) {
          localStorage.setItem("profileComplete", "true");
          console.log("💾 Set profileComplete to true");
        } else {
          localStorage.setItem("profileComplete", "false");
          console.log("💾 Set profileComplete to false");
        }
      }

      if (data.tripData) {
        localStorage.setItem("tripData", JSON.stringify(data.tripData));
        console.log("💾 Saved tripData to localStorage:", data.tripData);
      }

      if (data.tripIntentData) {
        localStorage.setItem("tripIntentData", JSON.stringify(data.tripIntentData));
        console.log("💾 Saved tripIntentData to localStorage:", data.tripIntentData);
      }

      if (data.anchorSelectData) {
        localStorage.setItem("anchorSelectData", JSON.stringify(data.anchorSelectData));
        console.log("💾 Saved anchorSelectData to localStorage:", data.anchorSelectData);
      }

      if (data.itineraryData) {
        localStorage.setItem("itineraryData", JSON.stringify(data.itineraryData));
        console.log("💾 Saved itineraryData to localStorage:", data.itineraryData);
      }

      setStatus("✅ Hydration complete! Check console for details.");

    } catch (err) {
      console.error("❌ Hydration error:", err);
      setError(err.message);
    }
  };

  const handleGoToRouter = () => {
    navigate("/localrouter");
  };

  const handleClearLocalStorage = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("profileComplete");
    localStorage.removeItem("tripData");
    localStorage.removeItem("tripIntentData");
    localStorage.removeItem("anchorSelectData");
    localStorage.removeItem("itineraryData");
    setLocalStorageData(null);
    setStatus("🗑️ localStorage cleared");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Hydrate Test Page</h1>
          <p className="text-gray-600">Test the hydration flow step by step</p>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-blue-800 font-medium">{status}</p>
          </div>

          {error && (
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-red-800 font-medium">Error: {error}</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleHydrate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              🚀 Hydrate Your Crap
            </button>

            <button
              onClick={handleGoToRouter}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              🧭 Go to LocalUniversalRouter
            </button>

            <button
              onClick={handleClearLocalStorage}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              🗑️ Clear localStorage
            </button>
          </div>

          {localStorageData && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Hydration Response:</h3>
              <pre className="text-xs overflow-auto max-h-64">
                {JSON.stringify(localStorageData, null, 2)}
              </pre>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => navigate("/")}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
