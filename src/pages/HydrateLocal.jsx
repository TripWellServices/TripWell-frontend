import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import BACKEND_URL from "../config";

export default function HydrateLocal() {
  const navigate = useNavigate();
  const [localStorageData, setLocalStorageData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    inspectLocalStorage();
  }, []);

  const inspectLocalStorage = () => {
    setIsLoading(true);
    
    // Get all localStorage data
    const data = {
      user: JSON.parse(localStorage.getItem("userData") || "null"),
      trip: JSON.parse(localStorage.getItem("tripData") || "null"),
      intent: JSON.parse(localStorage.getItem("tripIntentData") || "null"),
      anchors: JSON.parse(localStorage.getItem("anchorSelectData") || "null"),
      itinerary: JSON.parse(localStorage.getItem("itineraryData") || "null"),
      profileComplete: localStorage.getItem("profileComplete") || "false"
    };

    setLocalStorageData(data);
    setIsLoading(false);
  };

  const handleProceedToRouter = () => {
    navigate("/localrouter");
  };

  const handleRefreshData = () => {
    // Sync from backend, then re-inspect localStorage
    (async () => {
      try {
        setIsLoading(true);

        // Wait for Firebase auth to be ready
        await new Promise((resolve) => {
          const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            resolve(user);
          });
        });

        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
          console.log("❌ No Firebase user; can't refresh from server");
          inspectLocalStorage();
          return;
        }

        const token = await firebaseUser.getIdToken();
        const res = await fetch(`${BACKEND_URL}/tripwell/localflush`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (!res.ok) {
          console.log("❌ /localflush failed during refresh");
          inspectLocalStorage();
          return;
        }

        const payload = await res.json();
        console.log("🔄 Refreshed from /localflush:", payload);

        if (payload.userData) localStorage.setItem("userData", JSON.stringify(payload.userData));
        if (payload.tripData) localStorage.setItem("tripData", JSON.stringify(payload.tripData));
        if (payload.tripIntentData) localStorage.setItem("tripIntentData", JSON.stringify(payload.tripIntentData));
        if (payload.anchorSelectData) localStorage.setItem("anchorSelectData", JSON.stringify(payload.anchorSelectData));
        if (payload.itineraryData) localStorage.setItem("itineraryData", JSON.stringify(payload.itineraryData));
        if (payload.userData && typeof payload.userData.profileComplete !== "undefined") {
          localStorage.setItem("profileComplete", String(!!payload.userData.profileComplete));
        }

        // Re-inspect to update UI
        inspectLocalStorage();
      } catch (e) {
        console.error("❌ Refresh error:", e);
        inspectLocalStorage();
      }
    })();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">🔍</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Inspecting Your Data</h1>
            <p className="text-gray-600">Loading localStorage contents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Local Storage Data</h1>
            <p className="text-gray-600">Here's what we found in your browser's localStorage</p>
          </div>

          {/* Data Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* User Data */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 text-blue-600">👤 User Data</h3>
              {localStorageData.user ? (
                <div className="space-y-2 text-sm">
                  <div><strong>Firebase ID:</strong> {localStorageData.user.firebaseId || "Not set"}</div>
                  <div><strong>Email:</strong> {localStorageData.user.email || "Not set"}</div>
                  <div><strong>Name:</strong> {localStorageData.user.firstName} {localStorageData.user.lastName}</div>
                  <div><strong>Hometown:</strong> {localStorageData.user.hometownCity || "Not set"}</div>
                  <div><strong>Profile Complete:</strong> {localStorageData.profileComplete}</div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No user data found</p>
              )}
            </div>

            {/* Trip Data */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 text-green-600">✈️ Trip Data</h3>
              {localStorageData.trip ? (
                <div className="space-y-2 text-sm">
                  <div><strong>Trip ID:</strong> {localStorageData.trip.tripId || "Not set"}</div>
                  <div><strong>Name:</strong> {localStorageData.trip.tripName || "Not set"}</div>
                  <div><strong>City:</strong> {localStorageData.trip.city || "Not set"}</div>
                  <div><strong>Purpose:</strong> {localStorageData.trip.purpose || "Not set"}</div>
                  <div><strong>Dates:</strong> {localStorageData.trip.startDate ? new Date(localStorageData.trip.startDate).toLocaleDateString() : "Not set"} - {localStorageData.trip.endDate ? new Date(localStorageData.trip.endDate).toLocaleDateString() : "Not set"}</div>
                  <div><strong>Who With:</strong> {Array.isArray(localStorageData.trip.whoWith) ? localStorageData.trip.whoWith.join(", ") : "Not set"}</div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No trip data found</p>
              )}
            </div>

            {/* Intent Data */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 text-purple-600">🎯 Trip Intent</h3>
              {localStorageData.intent ? (
                <div className="space-y-2 text-sm">
                  <div><strong>Priorities:</strong> {Array.isArray(localStorageData.intent.priorities) ? localStorageData.intent.priorities.join(", ") : "Not set"}</div>
                  <div><strong>Vibes:</strong> {Array.isArray(localStorageData.intent.vibes) ? localStorageData.intent.vibes.join(", ") : "Not set"}</div>
                  <div><strong>Mobility:</strong> {Array.isArray(localStorageData.intent.mobility) ? localStorageData.intent.mobility.join(", ") : "Not set"}</div>
                  <div><strong>Travel Pace:</strong> {Array.isArray(localStorageData.intent.travelPace) ? localStorageData.intent.travelPace.join(", ") : "Not set"}</div>
                  <div><strong>Budget:</strong> {localStorageData.intent.budget || "Not set"}</div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No intent data found</p>
              )}
            </div>

            {/* Anchors & Itinerary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 text-orange-600">🧭 Anchors & Itinerary</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <strong>Anchors Selected:</strong>{" "}
                  {Array.isArray(localStorageData.anchors?.anchors)
                    ? localStorageData.anchors.anchors.length
                    : 0} anchors
                  {Array.isArray(localStorageData.anchors?.anchors) &&
                    localStorageData.anchors.anchors.length > 0 && (
                      <ul className="mt-2 list-disc list-inside text-gray-700">
                        {localStorageData.anchors.anchors.map((title, idx) => (
                          <li key={idx}>{title}</li>
                        ))}
                      </ul>
                    )}
                </div>
                <div>
                  <strong>Itinerary Days:</strong>{" "}
                  {Array.isArray(localStorageData.itinerary?.days)
                    ? localStorageData.itinerary.days.length
                    : 0} days
                  {Array.isArray(localStorageData.itinerary?.days) &&
                    localStorageData.itinerary.days.length > 0 && (
                      <ul className="mt-2 list-decimal list-inside text-gray-700">
                        {localStorageData.itinerary.days.map((day, idx) => (
                          <li key={idx}>
                            Day {day?.dayIndex || idx + 1}
                            {day?.summary ? `: ${day.summary}` : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleProceedToRouter}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              🚀 Proceed to Local Router
            </button>
            <button
              onClick={handleRefreshData}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              🔄 Refresh Data
            </button>
          </div>

          {/* Debug Info */}
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">🐛 Debug Info</h4>
            <p className="text-sm text-yellow-700">
              This page shows what's currently in your browser's localStorage. 
              If data is missing, you may need to complete the trip setup flow first.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
