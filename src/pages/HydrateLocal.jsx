import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import BACKEND_URL from "../config";

export default function HydrateLocal() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("🔐 Checking your account...");
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    handleHydrate();
  }, []);

  const handleHydrate = async () => {
    try {
      // Home already verified auth, so we can trust currentUser exists
      const firebaseUser = auth.currentUser;

             setStatus("🔐 Getting your data...");
       setProgress(20);
       
       // Add a small delay so user can see the progress
       await new Promise(resolve => setTimeout(resolve, 800));
       
       const token = await firebaseUser.getIdToken(true);
       setStatus("💾 Loading your trip information...");
       setProgress(40);
       
       // Add another delay
       await new Promise(resolve => setTimeout(resolve, 600));
      
      const hydrateRes = await fetch(`${BACKEND_URL}/tripwell/hydrate`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store"
      });
      
      if (!hydrateRes.ok) {
        const errorText = await hydrateRes.text();
        throw new Error(`Failed to load your data: ${hydrateRes.status}`);
      }
      
      const data = await hydrateRes.json();
      setStatus("💾 Saving your information...");
      setProgress(60);

      // Save all data to localStorage
      if (data.userData) {
        localStorage.setItem("userData", JSON.stringify(data.userData));
        
        if (data.userData.profileComplete) {
          localStorage.setItem("profileComplete", "true");
        } else {
          localStorage.setItem("profileComplete", "false");
        }
      }

      if (data.tripData) {
        localStorage.setItem("tripData", JSON.stringify(data.tripData));
      }

      if (data.tripIntentData) {
        localStorage.setItem("tripIntentData", JSON.stringify(data.tripIntentData));
      }

      if (data.anchorSelectData) {
        localStorage.setItem("anchorSelectData", JSON.stringify(data.anchorSelectData));
      }

      if (data.itineraryData) {
        localStorage.setItem("itineraryData", JSON.stringify(data.itineraryData));
      }

             setStatus("✅ All set! Taking you to your trip...");
       setProgress(100);

       // Auto-route to universal router after saving data
       setTimeout(() => {
         navigate("/localrouter");
       }, 2000);

    } catch (err) {
      console.error("❌ Hydration error:", err);
      setError(err.message);
      setStatus("❌ Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">🚀</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Loading Your Trip</h1>
            <p className="text-gray-600">{status}</p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {error && (
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-red-800 font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
              >
                Try again
              </button>
            </div>
          )}

          {!error && progress < 100 && (
            <div className="text-sm text-gray-500">
              Please wait while we prepare everything...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
