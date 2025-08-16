import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import BACKEND_URL from "../config";

export default function HydrateLocal() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("💾 Loading your data...");
  const [error, setError] = useState(null);

  useEffect(() => {
    const hydrateUser = async () => {
      try {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
          setError("No authenticated user found");
          return;
        }

        setStatus("💾 Hydrating localStorage...");
        
        // Call hydrate to populate localStorage
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
        
        const localStorageData = await hydrateRes.json();
        console.log("🔍 Hydrate response:", localStorageData);

        setStatus("💾 Saving to localStorage...");

        // Save all data to localStorage
        if (localStorageData.userData) {
          localStorage.setItem("userData", JSON.stringify(localStorageData.userData));
          console.log("💾 Saved userData to localStorage:", localStorageData.userData);
        }

        if (localStorageData.tripData) {
          localStorage.setItem("tripData", JSON.stringify(localStorageData.tripData));
          console.log("💾 Saved tripData to localStorage:", localStorageData.tripData);
        }

        if (localStorageData.tripIntentData) {
          localStorage.setItem("tripIntentData", JSON.stringify(localStorageData.tripIntentData));
          console.log("💾 Saved tripIntentData to localStorage:", localStorageData.tripIntentData);
        }

        if (localStorageData.anchorSelectData) {
          localStorage.setItem("anchorSelectData", JSON.stringify(localStorageData.anchorSelectData));
          console.log("💾 Saved anchorSelectData to localStorage:", localStorageData.anchorSelectData);
        }

        if (localStorageData.itineraryData) {
          localStorage.setItem("itineraryData", JSON.stringify(localStorageData.itineraryData));
          console.log("💾 Saved itineraryData to localStorage:", localStorageData.itineraryData);
        }

        setStatus("✅ Success! Routing to app...");

        // Route to universal router
        setTimeout(() => {
          navigate("/localrouter");
        }, 1000);
        
      } catch (err) {
        console.error("❌ Hydration error:", err);
        setError(err.message);
      }
    };

    hydrateUser();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚀</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">TripWell</h1>
          <p className="text-gray-600">Loading your experience...</p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-blue-800 font-medium">{status}</p>
          </div>

          {error && (
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-red-800 font-medium">Error: {error}</p>
              <button
                onClick={() => navigate("/")}
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Go Back
              </button>
            </div>
          )}

          {!error && status.includes("Success") && (
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-green-800 font-medium">✅ All set! Redirecting...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
