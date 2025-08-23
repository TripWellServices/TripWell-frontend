import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { getAuthConfig } from "../utils/auth";
import BACKEND_URL from "../config";

export default function LocalUniversalRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function universalRouter() {
      try {
        // Check if we're already on a live day route or debug route - if so, don't interfere
        const currentPath = location.pathname;
        console.log("🔍 LocalUniversalRouter checking path:", currentPath);
        
        const bypassPaths = [
          '/tripliveday',
          '/tripliveblock', 
          '/dayindextest',
          '/livedayreturner',
          '/tripdaylookback'
        ];
        
        const shouldBypass = bypassPaths.some(path => currentPath.startsWith(path) || currentPath === path);
        
        if (shouldBypass) {
          console.log("🚀 LocalUniversalRouter - Already on live day route, not interfering:", currentPath);
          setLoading(false);
          return;
        }
        
        console.log("🔍 LocalUniversalRouter - Starting universal routing check");

        // Get all localStorage data
        const userData = JSON.parse(localStorage.getItem("userData") || "null");
        const profileComplete = localStorage.getItem("profileComplete") === "true";
        const tripData = JSON.parse(localStorage.getItem("tripData") || "null");
        const tripIntentData = JSON.parse(localStorage.getItem("tripIntentData") || "null");
        let anchorLogic = JSON.parse(localStorage.getItem("anchorLogic") || "null");
        let itineraryData = JSON.parse(localStorage.getItem("itineraryData") || "null");
        
        // 🔍 DEBUG: Log the exact localStorage data
        console.log("🔍 UniversalRouter - Raw anchorLogic from localStorage:", anchorLogic);
        console.log("🔍 UniversalRouter - anchorLogic type:", typeof anchorLogic);
        console.log("🔍 UniversalRouter - anchorLogic.anchors:", anchorLogic?.anchors);
        console.log("🔍 UniversalRouter - anchorLogic.anchors type:", typeof anchorLogic?.anchors);
        console.log("🔍 UniversalRouter - anchorLogic.anchors length:", anchorLogic?.anchors?.length);

        console.log("🔍 Current localStorage state:", {
          userData: !!userData,
          profileComplete: profileComplete,
          tripData: !!tripData,
          tripIntentData: !!tripIntentData,
          anchorLogic: !!anchorLogic,
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

          // ✅ FIX: Use standardized auth utility
          const authConfig = await getAuthConfig();
          const flushRes = await fetch(`${BACKEND_URL}/tripwell/hydrate`, {
            headers: authConfig.headers,
            cache: "no-store"
          });

          if (!flushRes.ok) {
            console.log("❌ /hydrate failed while refreshing");
            // ✅ FIX: Add proper error handling
            if (flushRes.status === 401) {
              console.log("❌ Authentication error, routing to /access");
              return navigate("/access");
            }
            return;
          }

          const localStorageData = await flushRes.json();
          console.log("🔄 Refreshed from /hydrate:", localStorageData);

          if (localStorageData.userData) {
            localStorage.setItem("userData", JSON.stringify(localStorageData.userData));
          }
          if (localStorageData.tripData) {
            localStorage.setItem("tripData", JSON.stringify(localStorageData.tripData));
          }
          if (localStorageData.tripIntentData) {
            localStorage.setItem("tripIntentData", JSON.stringify(localStorageData.tripIntentData));
          }
          if (localStorageData.anchorLogicData) {
            localStorage.setItem("anchorLogic", JSON.stringify(localStorageData.anchorLogicData));
            console.log("💾 Saved anchorLogicData to localStorage as anchorLogic:", localStorageData.anchorLogicData);
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

          // ✅ FIX: Use standardized auth utility
          const authConfig = await getAuthConfig();
          const flushRes = await fetch(`${BACKEND_URL}/tripwell/hydrate`, {
            headers: authConfig.headers,
            cache: "no-store"
          });

          if (!flushRes.ok) {
            console.log("❌ /hydrate failed, routing to /access");
            // ✅ FIX: Add proper error handling
            if (flushRes.status === 401) {
              console.log("❌ Authentication error, routing to /access");
              return navigate("/access");
            }
            return navigate("/access");
          }

          const localStorageData = await flushRes.json();
          console.log("🔍 /hydrate response:", localStorageData);

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

          if (localStorageData.anchorLogicData) {
            localStorage.setItem("anchorLogic", JSON.stringify(localStorageData.anchorLogicData));
            console.log("💾 Saved anchorLogicData to localStorage as anchorLogic:", localStorageData.anchorLogicData);
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
        console.log("🔍 DEBUG - currentTripData:", currentTripData);
        console.log("🔍 DEBUG - currentTripData?.tripId:", currentTripData?.tripId);
        
        if (!currentTripData || !currentTripData.tripId) {
          console.log("❌ No tripId found, routing to /tripsetup");
          return navigate("/tripsetup");
        }

        // Step 4: Check if trip is complete
        console.log("🔍 DEBUG - currentTripData.tripComplete:", currentTripData.tripComplete);
        if (currentTripData.tripComplete === true) {
          console.log("✅ Trip is complete, routing to /tripcomplete");
          return navigate("/tripcomplete");
        }

        // Step 5: Check if trip has started
        console.log("🔍 DEBUG - currentTripData.startedTrip:", currentTripData.startedTrip);
        console.log("🔍 DEBUG - Current pathname:", location.pathname);
        if (currentTripData.startedTrip === true) {
          // If trip has started, route to LiveDayReturner for "welcome back" flow
          if (location.pathname.startsWith('/tripliveday') || location.pathname.startsWith('/tripliveblock')) {
            console.log("✅ Trip has started and navigating to live day, allowing navigation");
            console.log("✅ Pathname matches live day route, setting loading to false");
            setLoading(false);
            return;
          } else {
            console.log("✅ Trip has started, routing to /livedayreturner for welcome back flow");
            return navigate("/livedayreturner");
          }
        }

        // Step 6: Check trip intent
        if (!tripIntentData || !tripIntentData.tripIntentId) {
          console.log("❌ No tripIntentId found, routing to /tripintent");
          return navigate("/tripintent");
        }

        // Step 7: Check anchors (trust localStorage after hydration)
        console.log("🔍 DEEP DEBUG - anchorLogic:", anchorLogic);
        console.log("🔍 DEEP DEBUG - anchorLogic.anchors:", anchorLogic?.anchors);
        console.log("🔍 DEEP DEBUG - anchorLogic.anchors?.length:", anchorLogic?.anchors?.length);
        
        // Handle both data structures: full objects vs just titles
        const hasAnchors = anchorLogic && 
          anchorLogic.anchors && 
          anchorLogic.anchors.length > 0;
        
        if (!hasAnchors) {
          console.log("❌ No anchors in localStorage, routing to /anchorselect");
          return navigate("/anchorselect");
        }
        
        // Log what we found for debugging
        console.log("✅ Found anchors in localStorage:", {
          count: anchorLogic.anchors.length,
          firstAnchor: anchorLogic.anchors[0],
          isTitleString: typeof anchorLogic.anchors[0] === 'string',
          isObject: typeof anchorLogic.anchors[0] === 'object'
        });

        // Step 8: Check itinerary (trust localStorage after hydration)
        console.log("🔍 DEBUG - itineraryData:", itineraryData);
        console.log("🔍 DEBUG - itineraryData?.itineraryId:", itineraryData?.itineraryId);
        console.log("🔍 DEBUG - currentTripData.startedTrip:", currentTripData?.startedTrip);
        
        if (!itineraryData || !itineraryData.itineraryId) {
          console.log("❌ No itinerary in localStorage, routing to /itinerarybuild");
          return navigate("/itinerarybuild");
        }

        // Step 9: Route to PreTripHub if they have itinerary but haven't started trip
        if (itineraryData && itineraryData.itineraryId && !currentTripData.startedTrip) {
                  console.log("✅ Itinerary complete, routing to /pretriphub");
        return navigate("/pretriphub");
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

  return (
    <h1 className="text-2xl font-bold text-center mt-10">
      LocalUniversalRouter Loaded Successfully
      <br />
      <a href="/"  className="text-blue-600 underline">
        Home
      </a>
    </h1>
  ); 
}
