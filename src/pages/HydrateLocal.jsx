import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function HydrateLocal() {
  const navigate = useNavigate();
  const { 
    userData,
    tripData,
    tripIntentData,
    anchorSelectData,
    itineraryData,
    profileComplete,
    validation,
    loading,
    error,
    refreshFromBackend,
    setState,
  } = useAppData();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        setIsLoading(true);
        await refreshFromBackend();
      } catch (err) {
        console.error("❌ Hydration error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [refreshFromBackend]);

  const handleProceedToRouter = () => {
    navigate("/localrouter");
  };

  const handleRefreshData = async () => {
    try {
      setIsLoading(true);
      await refreshFromBackend();
    } catch (e) {
      // error is handled inside context state
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear all localStorage data
      localStorage.removeItem("userData");
      localStorage.removeItem("tripData");
      localStorage.removeItem("tripIntentData");
      localStorage.removeItem("anchorSelectData");
      localStorage.removeItem("itineraryData");
      localStorage.removeItem("profileComplete");
      
      console.log("🗑️ Cleared all localStorage data");
      
      // Sign out from Firebase
      await signOut(auth);
      console.log("🔐 Signed out from Firebase");
      
      // Navigate to home (which will redirect to /access for login)
      navigate("/");
    } catch (err) {
      console.error("❌ Logout error:", err);
      // Still try to navigate even if logout fails
      navigate("/");
    }
  };

  // Debug logging to see what data we have
  console.log("🔍 HydrateLocal data:", {
    userData,
    tripData,
    tripIntentData,
    anchorSelectData,
    itineraryData,
    loading: loadingUI
  });

  const loadingUI = isLoading || loading;
  if (loadingUI) {
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
        {userData ? (
                <div className="space-y-2 text-sm">
          <div><strong>Firebase ID:</strong> {userData.firebaseId || "Not set"}</div>
          <div><strong>Email:</strong> {userData.email || "Not set"}</div>
          <div><strong>Name:</strong> {userData.firstName} {userData.lastName}</div>
          <div><strong>Hometown:</strong> {userData.hometownCity || "Not set"}</div>
          <div><strong>Profile Complete:</strong> {userData.profileComplete ? "Yes" : "No"}</div>
          <div><strong>Role:</strong> {userData.role || "Not set"}</div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No user data found</p>
              )}
            </div>

            {/* Trip Data */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 text-green-600">✈️ Trip Data</h3>
        {tripData ? (
                <div className="space-y-2 text-sm">
          <div><strong>Trip ID:</strong> {tripData.tripId || "Not set"}</div>
          <div><strong>Name:</strong> {tripData.tripName || "Not set"}</div>
          <div><strong>City:</strong> {tripData.city || "Not set"}</div>
          <div><strong>Purpose:</strong> {tripData.purpose || "Not set"}</div>
          <div><strong>Dates:</strong> {tripData.startDate ? new Date(tripData.startDate).toLocaleDateString() : "Not set"} - {tripData.endDate ? new Date(tripData.endDate).toLocaleDateString() : "Not set"}</div>
          <div><strong>Who With:</strong> {Array.isArray(tripData.whoWith) ? tripData.whoWith.join(", ") : "Not set"}</div>
          <div><strong>Season:</strong> {tripData.season || "Not set"}</div>
          <div><strong>Days Total:</strong> {tripData.daysTotal || "Not set"}</div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No trip data found</p>
              )}
            </div>

            {/* Intent Data */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 text-purple-600">🎯 Trip Intent</h3>
        {tripIntentData ? (
                <div className="space-y-2 text-sm">
          <div><strong>Priorities:</strong> {Array.isArray(tripIntentData.priorities) ? tripIntentData.priorities.join(", ") : "Not set"}</div>
          <div><strong>Vibes:</strong> {Array.isArray(tripIntentData.vibes) ? tripIntentData.vibes.join(", ") : "Not set"}</div>
          <div><strong>Mobility:</strong> {Array.isArray(tripIntentData.mobility) ? tripIntentData.mobility.join(", ") : "Not set"}</div>
          <div><strong>Travel Pace:</strong> {Array.isArray(tripIntentData.travelPace) ? tripIntentData.travelPace.join(", ") : "Not set"}</div>
          <div><strong>Budget:</strong> {tripIntentData.budget || "Not set"}</div>
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
                  {Array.isArray(anchorSelectData?.anchors)
                    ? anchorSelectData.anchors.length
                    : 0} anchors
                  {Array.isArray(anchorSelectData?.anchors) &&
                    anchorSelectData.anchors.length > 0 && (
                      <ul className="mt-2 list-disc list-inside text-gray-700">
                        {anchorSelectData.anchors.map((title, idx) => (
                          <li key={idx}>{title}</li>
                        ))}
                      </ul>
                    )}
                </div>
                <div>
                  <strong>Itinerary Days:</strong>{" "}
                  {Array.isArray(itineraryData?.days)
                    ? itineraryData.days.length
                    : 0} days
                  {Array.isArray(itineraryData?.days) &&
                    itineraryData.days.length > 0 && (
                      <ul className="mt-2 list-decimal list-inside text-gray-700">
                        {itineraryData.days.map((day, idx) => (
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
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              🚪 Logout & Clear Data
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
