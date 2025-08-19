import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import BACKEND_URL from "../config";

export default function LocalUniversalRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function universalRouter() {
      try {
        console.log("🔍 LocalUniversalRouter - Starting universal routing check");

        // Get all localStorage data
        const userData = JSON.parse(localStorage.getItem("userData") || "null");
        const profileComplete = localStorage.getItem("profileComplete") === "true";
        const tripData = JSON.parse(localStorage.getItem("tripData") || "null");
        const tripIntentData = JSON.parse(localStorage.getItem("tripIntentData") || "null");
        let anchorSelectData = JSON.parse(localStorage.getItem("anchorSelectData") || "null");
        let itineraryData = JSON.parse(localStorage.getItem("itineraryData") || "null");

        console.log("🔍 Current localStorage state:", {
          userData: !!userData,
          profileComplete: profileComplete,
          tripData: !!tripData,
          tripIntentData: !!tripIntentData,
          anchorSelectData: !!anchorSelectData,
          itineraryData: !!itineraryData
        });

        // Helper to refresh localStorage from server
        async function refreshFromServer() {
          // Wait for Firebase auth
          await new Promise(resolve => {
            const unsubscribe = auth.onAuthStateChanged(user => {
              unsubscribe();
              resolve(user);
            });
          });

          const firebaseUser = auth.currentUser;
          if (!firebaseUser) {
            console.log("❌ No Firebase user, routing to /access");
            return navigate("/access");
          }

          const token = await firebaseUser.getIdToken();
          const flushRes = await fetch(`${BACKEND_URL}/tripwell/localflush`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store"
          });

          if (!flushRes.ok) {
            console.log("❌ /localflush failed while refreshing");
            return;
          }

          const localStorageData = await flushRes.json();
          console.log("🔄 Refreshed from /localflush:", localStorageData);

          if (localStorageData.userData) {
            localStorage.setItem("userData", JSON.stringify(localStorageData.userData));
          }
          if (localStorageData.tripData) {
            localStorage.setItem("tripData", JSON.stringify(localStorageData.tripData));
          }
          if (localStorageData.tripIntentData) {
            localStorage.setItem("tripIntentData", JSON.stringify(localStorageData.tripIntentData));
          }
          if (localStorageData.anchorSelectData) {
            localStorage.setItem("anchorSelectData", JSON.stringify(localStorageData.anchorSelectData));
          }
          if (localStorageData.itineraryData) {
            localStorage.setItem("itineraryData", JSON.stringify(localStorageData.itineraryData));
          }
        }

        // Step 1: Check if we have user data, if not hydrate from backend
        if (!userData) {
          console.log("❌ No userData in localStorage, calling /localflush");

          // Wait for Firebase auth
          await new Promise(resolve => {
            const unsubscribe = auth.onAuthStateChanged(user => {
              unsubscribe();
              resolve(user);
            });
          });

          const firebaseUser = auth.currentUser;
          if (!firebaseUser) {
            console.log("❌ No Firebase user, routing to /access");
            return navigate("/access");
          }

          const token = await firebaseUser.getIdToken();
          const flushRes = await fetch(`${BACKEND_URL}/tripwell/localflush`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store"
          });

          if (!flushRes.ok) {
            console.log("❌ /localflush failed, routing to /access");
            return navigate("/access");
          }

          const localStorageData = await flushRes.json();
          console.log("🔍 /localflush response:", localStorageData);

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

          // Set profileComplete flag based on backend data
          if (localStorageData.userData?.profileComplete) {
            localStorage.setItem("profileComplete", "true");
            console.log("💾 Set profileComplete to true");
          } else {
            localStorage.setItem("profileComplete", "false");
            console.log("💾 Set profileComplete to false");
          }
        }

        // Re-read localStorage after potential updates
        const currentUserData = JSON.parse(localStorage.getItem("userData") || "null");
        const currentProfileComplete = localStorage.getItem("profileComplete") === "true";
        const currentTripData = JSON.parse(localStorage.getItem("tripData") || "null");

        // Step 2: Check if profile is complete
        if (!currentProfileComplete) {
          console.log("❌ Profile not complete, routing to /profilesetup");
          return navigate("/profilesetup");
        }

        // Step 3: Check trip data
        if (!currentTripData || !currentTripData.tripId) {
          console.log("❌ No tripId found, routing to /tripsetup");
          return navigate("/tripsetup");
        }

        // Step 4: Check if trip is complete
        if (currentTripData.tripComplete === true) {
          console.log("✅ Trip is complete, routing to /tripcomplete");
          return navigate("/tripcomplete");
        }

        // Step 5: Check if trip has started
        if (currentTripData.startedTrip === true) {
          console.log("✅ Trip has started, routing to /prephub");
          return navigate("/prephub");
        }

        // Step 6: Check trip intent
        if (!tripIntentData || !tripIntentData.tripIntentId) {
          console.log("❌ No tripIntentId found, routing to /tripintent");
          return navigate("/tripintent");
        }

        // Step 7: Check anchors (refresh from server if missing locally)
        if (!anchorSelectData || !anchorSelectData.anchors || anchorSelectData.anchors.length === 0) {
          console.log("❌ No anchors in localStorage; refreshing from server before routing");
          await refreshFromServer();
          anchorSelectData = JSON.parse(localStorage.getItem("anchorSelectData") || "null");
          itineraryData = JSON.parse(localStorage.getItem("itineraryData") || "null");

          if (!anchorSelectData || !anchorSelectData.anchors || anchorSelectData.anchors.length === 0) {
            console.log("❌ Still no anchors after refresh, routing to /anchorselect");
            return navigate("/anchorselect");
          }
        }

        // Step 8: Check itinerary (refresh first if missing)
        if (!itineraryData || !itineraryData.itineraryId) {
          console.log("❌ No itinerary in localStorage; refreshing from server before routing");
          await refreshFromServer();
          itineraryData = JSON.parse(localStorage.getItem("itineraryData") || "null");
          if (!itineraryData || !itineraryData.itineraryId) {
            console.log("❌ Still no itinerary, routing to /itinerarybuild");
            return navigate("/itinerarybuild");
          }
        }

        // All conditions met - let them continue to their intended route
        console.log("✅ All conditions met, allowing navigation to:", location.pathname);
        setLoading(false);

      } catch (error) {
        console.error("❌ UniversalRouter error:", error);
        navigate("/access");
      }
    }

    universalRouter();
  }, [navigate, location.pathname]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center space-y-4">
        <div className="animate-pulse">
          <h2 className="text-xl font-semibold text-gray-800">Loading your trip...</h2>
          <p className="text-gray-600">Checking your progress and routing you to the right place</p>
        </div>
      </div>
    );
  }

  return null; 
}
