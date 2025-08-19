import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import BACKEND_URL from "../config";

export default function HydrateLocal() {
  const navigate = useNavigate();
  const [localStorageData, setLocalStorageData] = useState({});
  const [validation, setValidation] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    handleHydrate();
  }, []);

  const handleHydrate = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        setError("No Firebase user found");
        return;
      }

      const token = await firebaseUser.getIdToken(true);
      
      // Call the backend hydration endpoint
      const hydrateRes = await fetch(`${BACKEND_URL}/tripwell/hydrate`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store"
      });
      
      if (!hydrateRes.ok) {
        throw new Error(`Failed to load your data: ${hydrateRes.status}`);
      }
      
      const data = await hydrateRes.json();
      
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

      // Set the data for display
      setLocalStorageData(data);
      setValidation(data.validation || {});

    } catch (err) {
      console.error("❌ Hydration error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
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
              <span className="text-2xl">🔄</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Loading Your Data</h1>
            <p className="text-gray-600">Syncing from backend to localStorage...</p>
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
            <p className="text-gray-600">Synced from backend to localStorage</p>
          </div>

          {/* Validation Status */}
          {validation && (
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-3 text-purple-600">🔍 Data Validation</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {validation.isValid ? (
                  <div className="text-green-600 font-semibold">✅ All data present and valid</div>
                ) : (
                  <div>
                    <div className="text-red-600 font-semibold mb-2">⚠️ Missing data detected:</div>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {validation.summary?.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Data Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* User Data */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 text-blue-600">👤 User Data</h3>
              {localStorageData.userData ? (
                <div className="space-y-2 text-sm">
                  <div><strong>Firebase ID:</strong> {localStorageData.userData.firebaseId || "Not set"}</div>
                  <div><strong>Email:</strong> {localStorageData.userData.email || "Not set"}</div>
                  <div><strong>Name:</strong> {localStorageData.userData.firstName} {localStorageData.userData.lastName}</div>
                  <div><strong>Hometown:</strong> {localStorageData.userData.hometownCity || "Not set"}</div>
                  <div><strong>Profile Complete:</strong> {localStorageData.userData.profileComplete ? "Yes" : "No"}</div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No user data found</p>
              )}
            </div>

            {/* Trip Data */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 text-green-600">✈️ Trip Data</h3>
              {localStorageData.tripData ? (
                <div className="space-y-2 text-sm">
                  <div><strong>Trip ID:</strong> {localStorageData.tripData.tripId || "Not set"}</div>
                  <div><strong>Name:</strong> {localStorageData.tripData.tripName || "Not set"}</div>
                  <div><strong>City:</strong> {localStorageData.tripData.city || "Not set"}</div>
                  <div><strong>Purpose:</strong> {localStorageData.tripData.purpose || "Not set"}</div>
                  <div><strong>Dates:</strong> {localStorageData.tripData.startDate ? new Date(localStorageData.tripData.startDate).toLocaleDateString() : "Not set"} - {localStorageData.tripData.endDate ? new Date(localStorageData.tripData.endDate).toLocaleDateString() : "Not set"}</div>
                  <div><strong>Who With:</strong> {Array.isArray(localStorageData.tripData.whoWith) ? localStorageData.tripData.whoWith.join(", ") : "Not set"}</div>
                  <div><strong>Season:</strong> {localStorageData.tripData.season || "Not set"}</div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No trip data found</p>
              )}
            </div>

            {/* Intent Data */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 text-purple-600">🎯 Trip Intent</h3>
              {localStorageData.tripIntentData ? (
                <div className="space-y-2 text-sm">
                  <div><strong>Priorities:</strong> {Array.isArray(localStorageData.tripIntentData.priorities) ? localStorageData.tripIntentData.priorities.join(", ") : "Not set"}</div>
                  <div><strong>Vibes:</strong> {Array.isArray(localStorageData.tripIntentData.vibes) ? localStorageData.tripIntentData.vibes.join(", ") : "Not set"}</div>
                  <div><strong>Mobility:</strong> {Array.isArray(localStorageData.tripIntentData.mobility) ? localStorageData.tripIntentData.mobility.join(", ") : "Not set"}</div>
                  <div><strong>Travel Pace:</strong> {Array.isArray(localStorageData.tripIntentData.travelPace) ? localStorageData.tripIntentData.travelPace.join(", ") : "Not set"}</div>
                  <div><strong>Budget:</strong> {localStorageData.tripIntentData.budget || "Not set"}</div>
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

          {/* Error Display */}
          {error && (
            <div className="mt-8 p-4 bg-red-50 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">❌ Error</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Debug Info */}
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">🐛 Debug Info</h4>
            <p className="text-sm text-yellow-700">
              This page syncs data from the backend to localStorage. 
              The validation shows what data might be missing from your trip setup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
