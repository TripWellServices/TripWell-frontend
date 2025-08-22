import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://gofastbackend.onrender.com";

export default function HydrateLocal() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [hydratedData, setHydratedData] = useState({});

  useEffect(() => {
    hydrateData();
  }, []);

  const hydrateData = async () => {
    try {
      setIsLoading(true);
      setStatus("Hydrating from backend...");

      // Wait for Firebase auth to be ready (same pattern as other components)
      await new Promise(resolve => {
        const unsubscribe = auth.onAuthStateChanged(user => {
          unsubscribe();
          resolve(user);
        });
      });

      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error("No authenticated user");
      }

      const token = await firebaseUser.getIdToken();
      const response = await fetch(`${BACKEND_URL}/tripwell/hydrate`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(`Hydration failed: ${response.status}`);
      }

      const freshData = await response.json();
      
             // 🔍 DEBUG: Log what backend sent
       console.log("🔍 Backend sent anchorLogicData:", freshData.anchorLogicData);
       console.log("🔍 Backend sent anchorLogicData?.anchors:", freshData.anchorLogicData?.anchors);
      
      // Save all data to localStorage
      if (freshData.userData) localStorage.setItem("userData", JSON.stringify(freshData.userData));
      if (freshData.tripData) localStorage.setItem("tripData", JSON.stringify(freshData.tripData));
      if (freshData.tripIntentData) localStorage.setItem("tripIntentData", JSON.stringify(freshData.tripIntentData));
                    if (freshData.anchorLogicData) {
                console.log("🔍 Setting anchorLogic to localStorage:", freshData.anchorLogicData);
                localStorage.setItem("anchorLogic", JSON.stringify(freshData.anchorLogicData));
              } else {
                console.log("🔍 No anchorLogicData from backend!");
              }
      if (freshData.itineraryData) localStorage.setItem("itineraryData", JSON.stringify(freshData.itineraryData));

             // Get what's actually in localStorage after hydration
       const localStorageData = {
         userData: JSON.parse(localStorage.getItem("userData") || "null"),
         tripData: JSON.parse(localStorage.getItem("tripData") || "null"),
         tripIntentData: JSON.parse(localStorage.getItem("tripIntentData") || "null"),
         anchorLogic: JSON.parse(localStorage.getItem("anchorLogic") || "null"),
         itineraryData: JSON.parse(localStorage.getItem("itineraryData") || "null"),
         profileComplete: localStorage.getItem("profileComplete") === "true"
       };
      
      setHydratedData(localStorageData);
      setStatus(`✅ Hydrated: ${Object.keys(localStorageData).filter(k => localStorageData[k]).length} models`);

    } catch (err) {
      console.error("❌ Hydration error:", err);
      setStatus(`❌ Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    navigate("/localrouter");
  };

  const handleLogout = async () => {
    localStorage.clear();
    await signOut(auth);
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Hydrating...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">HydrateLocal</h1>
      <p className="mb-4">{status}</p>
      
      {/* Show what got hydrated */}
      <div className="bg-gray-50 p-4 rounded mb-4 text-sm">
        <h3 className="font-semibold mb-2">After Hydration:</h3>
        <div className="space-y-1">
          <div>👤 User: {hydratedData.userData ? "✅" : "❌"}</div>
          <div>✈️ Trip: {hydratedData.tripData ? "✅" : "❌"}</div>
          <div>🎯 Intent: {hydratedData.tripIntentData ? "✅" : "❌"}</div>
                            <div>⚓ Anchors: {hydratedData.anchorLogicData ? "✅" : "❌"}</div>
          <div>📅 Itinerary: {hydratedData.itineraryData ? "✅" : "❌"}</div>
        </div>
      </div>
       
       <div className="space-y-2">
         <button onClick={handleContinue} className="w-full bg-blue-600 text-white py-2 rounded">
           Continue to Router
         </button>
         <button onClick={hydrateData} className="w-full bg-gray-600 text-white py-2 rounded">
           Refresh Data
         </button>
         <button onClick={handleLogout} className="w-full bg-red-600 text-white py-2 rounded">
           Logout
         </button>
       </div>
    </div>
  );
}
