import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { getAuthConfig } from "../utils/auth";
import BACKEND_URL from "../config";

export default function LocalUniversalRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [showInitialLoading, setShowInitialLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  const hydrateData = async () => {
    try {
      if (isHydrated) {
        console.log("🔍 UniversalRouter - Already hydrated, skipping...");
        return;
      }
      
      // Check if user is being routed by Access.jsx (profile incomplete)
      const currentProfileComplete = localStorage.getItem("profileComplete") === "true";
      if (!currentProfileComplete) {
        console.log("🔍 UniversalRouter - Profile incomplete, Access.jsx will handle routing, skipping...");
        return;
      }
      
      console.log("🔄 UniversalRouter - Starting hydration...");
      const authConfig = await getAuthConfig();
      
      const response = await fetch(`${BACKEND_URL}/tripwell/hydrate`, {
        headers: authConfig.headers,
        cache: "no-store"
      });

      if (!response.ok) {
        console.log("❌ /hydrate failed:", response.status);
        if (response.status === 401) {
          console.log("❌ Authentication error, routing to /access");
          navigate("/access");
          return;
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const freshData = await response.json();
      console.log("✅ UniversalRouter - Hydration complete");
      
      // Save data to localStorage
      if (freshData.userData) {
        localStorage.setItem("userData", JSON.stringify(freshData.userData));
      }
      if (freshData.tripData) {
        localStorage.setItem("tripData", JSON.stringify(freshData.tripData));
      }
      if (freshData.tripIntentData) {
        localStorage.setItem("tripIntentData", JSON.stringify(freshData.tripIntentData));
      }
      if (freshData.anchorLogicData) {
        localStorage.setItem("anchorLogic", JSON.stringify(freshData.anchorLogicData));
      }
      if (freshData.itineraryData) {
        localStorage.setItem("itineraryData", JSON.stringify(freshData.itineraryData));
      }

      setIsHydrated(true);
      console.log("✅ UniversalRouter - Data saved, showing continue button");

    } catch (err) {
      console.error("❌ UniversalRouter hydration error:", err);
      navigate("/access");
    }
  };

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
          '/tripdaylookback',
          '/postprofileroleselect'
        ];
        
        const shouldBypass = bypassPaths.some(path => currentPath.startsWith(path) || currentPath === path);
        
        if (shouldBypass) {
          console.log("🚀 LocalUniversalRouter - Already on live day route, not interfering:", currentPath);
          setLoading(false);
          return;
        }
        
        // Show initial loading for 800ms, then hydrate
        if (showInitialLoading) {
          console.log("⏳ Showing initial loading screen...");
          setTimeout(() => {
            setShowInitialLoading(false);
            hydrateData();
          }, 800);
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
            if (flushRes.status === 404) {
              console.log("❌ User not found (deleted), clearing cache and routing to /access");
              // Clear all localStorage data for deleted user
              localStorage.clear();
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
            if (flushRes.status === 404) {
              console.log("❌ User not found (deleted), clearing cache and routing to /access");
              // Clear all localStorage data for deleted user
              localStorage.clear();
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

        // Step 2: Profile completion is handled by Access.jsx
        // LocalUniversalRouter assumes profile is complete since Access.jsx already filtered
        console.log("✅ Profile completion check handled by Access.jsx, continuing with trip flow");

        // Step 3: Check trip data and role
        console.log("🔍 DEBUG - currentTripData:", currentTripData);
        console.log("🔍 DEBUG - currentTripData?.tripId:", currentTripData?.tripId);
        console.log("🔍 DEBUG - currentUserData?.role:", currentUserData?.role);
        
        // If user has profile but no trip/role, route to role selection
        if (!currentTripData || !currentTripData.tripId || currentUserData?.role === "noroleset") {
          console.log("❌ No tripId or role not set, routing to /postprofileroleselect");
          return navigate("/postprofileroleselect");
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
  }, [navigate, location.pathname, showInitialLoading, isHydrated]);

  // Show initial loading screen (same design as Home)
  if (showInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-300 to-blue-200 flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="space-y-6">
            {/* TripWell Logo */}
            <div className="flex flex-col items-center space-y-4">
              <svg 
                width="140" 
                height="140" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-lg"
              >
                <path 
                  d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L12 21L16 22V20.5L14 19V13.5L22 16Z" 
                  fill="#0ea5e9"
                />
              </svg>
              
              {/* TripWell Text */}
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                  <span className="text-sky-100">Trip</span>
                  <span className="text-white">Well</span>
                </h1>
                <p className="text-lg text-sky-50 font-medium drop-shadow-md">
                  Loading Your Adventure
                </p>
              </div>
            </div>
          </div>

          {/* Loading spinner */}
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show "Ready to continue?" button after hydration
  if (isHydrated && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-white/20">
          <div className="text-center space-y-6">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="font-semibold text-green-800 mb-2">Trip details complete!</h3>
            <p className="text-green-600 text-sm mb-4">Looks like you've got some cool stuff done? Ready to keep going?</p>
            <button
              onClick={() => setLoading(false)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              🚀 Let's Go!
            </button>
          </div>
        </div>
      </div>
    );
  }

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
