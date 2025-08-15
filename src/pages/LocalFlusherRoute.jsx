import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import BACKEND_URL from "../config";

export default function LocalFlusherRoute() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function flushFromBackend() {
      try {
        setStatus("🔍 Checking Firebase auth...");
        
        // Wait for Firebase auth
        await new Promise(resolve => {
          const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe();
            resolve(user);
          });
        });

        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
          setStatus("❌ No Firebase user found");
          setTimeout(() => navigate("/access"), 2000);
          return;
        }

        setStatus("🔄 Calling backend to flush all localStorage data...");
        const token = await firebaseUser.getIdToken();
        const flushRes = await fetch(`${BACKEND_URL}/tripwell/localflush`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store"
        });

        if (!flushRes.ok) {
          setStatus("❌ Flush failed - user may not exist");
          setTimeout(() => navigate("/access"), 2000);
          return;
        }

        const localStorageData = await flushRes.json();
        console.log("🔍 Backend flush response:", localStorageData);

        // Save all data to localStorage
        setStatus("💾 Saving data to localStorage...");
        
        if (localStorageData.userData) {
          localStorage.setItem("userData", JSON.stringify(localStorageData.userData));
          console.log("💾 Saved userData:", localStorageData.userData);
        }
        
        if (localStorageData.tripData) {
          localStorage.setItem("tripData", JSON.stringify(localStorageData.tripData));
          console.log("💾 Saved tripData:", localStorageData.tripData);
        }
        
        if (localStorageData.tripIntentData) {
          localStorage.setItem("tripIntentData", JSON.stringify(localStorageData.tripIntentData));
          console.log("💾 Saved tripIntentData:", localStorageData.tripIntentData);
        }
        
        if (localStorageData.anchorSelectData) {
          localStorage.setItem("anchorSelectData", JSON.stringify(localStorageData.anchorSelectData));
          console.log("💾 Saved anchorSelectData:", localStorageData.anchorSelectData);
        }
        
        if (localStorageData.itineraryData) {
          localStorage.setItem("itineraryData", JSON.stringify(localStorageData.itineraryData));
          console.log("💾 Saved itineraryData:", localStorageData.itineraryData);
        }

        setStatus("✅ Flush complete! Redirecting to universal router...");
        console.log("✅ LocalStorage flush complete");
        
        // Redirect to universal router to handle routing
        setTimeout(() => navigate("/localrouter"), 1000);

      } catch (error) {
        console.error("❌ Flush error:", error);
        setStatus("❌ Flush failed: " + error.message);
        setTimeout(() => navigate("/access"), 3000);
      } finally {
        setLoading(false);
      }
    }

    flushFromBackend();
  }, [navigate]);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">
          🔄 LocalStorage Flusher
        </h1>
        <p className="text-gray-600">
          Syncing your data from the backend to localStorage
        </p>
      </div>

      <div className="bg-blue-50 rounded-lg p-6">
        <div className="text-center space-y-4">
          {loading ? (
            <div className="animate-pulse">
              <div className="text-lg font-semibold text-blue-800">{status}</div>
              <div className="text-sm text-blue-600">Please wait...</div>
            </div>
          ) : (
            <div>
              <div className="text-lg font-semibold text-green-800">{status}</div>
              <div className="text-sm text-green-600">Redirecting...</div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => navigate("/")}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          ← Back to Main App
        </button>
      </div>
    </div>
  );
}
