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
      
      // Save all data to localStorage
      if (freshData.userData) localStorage.setItem("userData", JSON.stringify(freshData.userData));
      if (freshData.tripData) localStorage.setItem("tripData", JSON.stringify(freshData.tripData));
      if (freshData.tripIntentData) localStorage.setItem("tripIntentData", JSON.stringify(freshData.tripIntentData));
      if (freshData.anchorSelectData) localStorage.setItem("anchorSelectData", JSON.stringify(freshData.anchorSelectData));
      if (freshData.itineraryData) localStorage.setItem("itineraryData", JSON.stringify(freshData.itineraryData));

      // Get what's actually in localStorage after hydration
      const localStorageData = {
        userData: JSON.parse(localStorage.getItem("userData") || "null"),
        tripData: JSON.parse(localStorage.getItem("tripData") || "null"),
        tripIntentData: JSON.parse(localStorage.getItem("tripIntentData") || "null"),
        anchorSelectData: JSON.parse(localStorage.getItem("anchorSelectData") || "null"),
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
          <div>⚓ Anchors: {hydratedData.anchorSelectData ? "✅" : "❌"}</div>
          <div>📅 Itinerary: {hydratedData.itineraryData ? "✅" : "❌"}</div>
        </div>
                 {hydratedData.tripData && (
           <div className="mt-2 text-xs text-gray-600">
             <div>Trip: {hydratedData.tripData.tripName} ({hydratedData.tripData.city})</div>
             <div>Season: {hydratedData.tripData.season || "Not set"}</div>
             <div>Days Total: {hydratedData.tripData.daysTotal || "Not set"}</div>
             <div>Started: {hydratedData.tripData.startedTrip ? "Yes" : "No"}</div>
             <div>Complete: {hydratedData.tripData.tripComplete ? "Yes" : "No"}</div>
           </div>
         )}
         {hydratedData.itineraryData && (
           <div className="mt-2 text-xs text-gray-600">
             <div>Days: {hydratedData.itineraryData.days?.length || 0}</div>
             <div>Itinerary ID: {hydratedData.itineraryData.itineraryId || "Not set"}</div>
           </div>
         )}
         {hydratedData.userData && (
           <div className="mt-2 text-xs text-gray-600">
             <div>Role: {hydratedData.userData.role || "Not set"}</div>
             <div>Profile Complete: {hydratedData.userData.profileComplete ? "Yes" : "No"}</div>
           </div>
         )}
         {hydratedData.tripIntentData && (
           <div className="mt-2 text-xs text-gray-600">
             <div>Priorities: {hydratedData.tripIntentData.priorities?.join(", ") || "None"}</div>
             <div>Vibes: {hydratedData.tripIntentData.vibes?.join(", ") || "None"}</div>
             <div>Mobility: {hydratedData.tripIntentData.mobility?.join(", ") || "None"}</div>
             <div>Travel Pace: {hydratedData.tripIntentData.travelPace?.join(", ") || "None"}</div>
             <div>Budget: {hydratedData.tripIntentData.budget || "None"}</div>
           </div>
         )}
      </div>
      
             {/* Raw Data Display */}
       <div className="bg-gray-100 p-4 rounded mb-4">
         <h3 className="font-semibold mb-2 text-sm">🔍 RAW DATA (All Fields):</h3>
         <div className="space-y-4 text-xs">
           {hydratedData.userData && (
             <div>
               <h4 className="font-semibold text-blue-600">👤 USER DATA:</h4>
               <pre className="bg-white p-2 rounded overflow-auto max-h-32">
                 {JSON.stringify(hydratedData.userData, null, 2)}
               </pre>
             </div>
           )}
           {hydratedData.tripData && (
             <div>
               <h4 className="font-semibold text-green-600">✈️ TRIP DATA:</h4>
               <pre className="bg-white p-2 rounded overflow-auto max-h-32">
                 {JSON.stringify(hydratedData.tripData, null, 2)}
               </pre>
             </div>
           )}
           {hydratedData.tripIntentData && (
             <div>
               <h4 className="font-semibold text-purple-600">🎯 TRIP INTENT DATA:</h4>
               <pre className="bg-white p-2 rounded overflow-auto max-h-32">
                 {JSON.stringify(hydratedData.tripIntentData, null, 2)}
               </pre>
             </div>
           )}
           {hydratedData.anchorSelectData && (
             <div>
               <h4 className="font-semibold text-orange-600">⚓ ANCHOR DATA:</h4>
               <pre className="bg-white p-2 rounded overflow-auto max-h-32">
                 {JSON.stringify(hydratedData.anchorSelectData, null, 2)}
               </pre>
             </div>
           )}
           {hydratedData.itineraryData && (
             <div>
               <h4 className="font-semibold text-indigo-600">📅 ITINERARY DATA:</h4>
               <pre className="bg-white p-2 rounded overflow-auto max-h-32">
                 {JSON.stringify(hydratedData.itineraryData, null, 2)}
               </pre>
             </div>
           )}
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
