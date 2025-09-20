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
  const [isReady, setIsReady] = useState(false);

  const hydrateData = async () => {
    try {
      if (isReady) {
        console.log("🔍 UniversalRouter - Already ready, skipping...");
        return;
      }
      
        // Check if user is being routed by Access.jsx (profile incomplete)
        const currentProfileComplete = localStorage.getItem("profileComplete") === "true";
        if (!currentProfileComplete) {
          console.log("🔍 UniversalRouter - Profile incomplete, Access.jsx will handle routing, skipping...");
          setLoading(false);
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

      setIsReady(true);
      console.log("✅ UniversalRouter - Data saved, ready to show button");

    } catch (err) {
      console.error("❌ UniversalRouter hydration error:", err);
      navigate("/access");
    }
  };

  useEffect(() => {
    async function universalRouter() {
      try {
        console.log("🚀 LocalUniversalRouter useEffect started");
        
        // 🚨 CRITICAL: Guard - disable UniversalRouter during Access/ProfileSetup
        if (location.pathname === "/access" || location.pathname === "/profilesetup") {
          console.log("⏸️ UniversalRouter disabled during Access/Profile flow");
          setLoading(false);
          return;
        }
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

        // Check if profile is incomplete - if so, don't run any routing logic
        const currentProfileComplete = localStorage.getItem("profileComplete") === "true";
        if (!currentProfileComplete) {
          console.log("🔍 LocalUniversalRouter - Profile incomplete, Access.jsx will handle routing, skipping...");
          setLoading(false);
          return;
        }

        // Get all localStorage data (NEW FLOW)
        console.log("🔍 Reading localStorage data...");
        const userData = JSON.parse(localStorage.getItem("userData") || "null");
        const profileComplete = localStorage.getItem("profileComplete") === "true";
        const tripData = JSON.parse(localStorage.getItem("tripData") || "null");
        const tripPersonaData = JSON.parse(localStorage.getItem("tripPersonaData") || "null");
        const selectedMetas = JSON.parse(localStorage.getItem("selectedMetas") || "[]");
        const selectedSamples = JSON.parse(localStorage.getItem("selectedSamples") || "[]");
        let itineraryData = JSON.parse(localStorage.getItem("itineraryData") || "null");
        console.log("🔍 localStorage data read successfully");
        
        // 🔍 DEBUG: Log the exact localStorage data (NEW FLOW)
        console.log("🔍 UniversalRouter - Raw tripPersonaData from localStorage:", tripPersonaData);
        console.log("🔍 UniversalRouter - selectedMetas:", selectedMetas);
        console.log("🔍 UniversalRouter - selectedSamples:", selectedSamples);
        console.log("🔍 UniversalRouter - tripPersonaData type:", typeof tripPersonaData);
        console.log("🔍 UniversalRouter - selectedMetas length:", selectedMetas?.length);
        console.log("🔍 UniversalRouter - selectedSamples length:", selectedSamples?.length);

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
        const currentTripData = JSON.parse(localStorage.getItem("tripData") || "null");

        // Step 2: Profile completion is handled by Access.jsx
        // LocalUniversalRouter assumes profile is complete since Access.jsx already filtered
        console.log("✅ Profile completion check handled by Access.jsx, continuing with trip flow");

        // 🎯 SIMPLIFIED ROUTING LOGIC - Focus on actual flags that matter
        
        // Step 1: No trip data = need to create/join trip
        if (!currentTripData || !currentTripData.tripId) {
          console.log("❌ No trip data, showing button for role selection");
          setLoading(false); // Show the button, don't keep loading
          return;
        }

        console.log("✅ Trip data found, continuing with routing logic");

        // Step 2: Trip complete = go to completion page
        if (currentTripData.tripComplete === true) {
          console.log("✅ Trip complete, routing to /tripcomplete");
          return navigate("/tripcomplete");
        }

        // Step 3: Trip started = go to live trip
        if (currentTripData.startedTrip === true) {
          console.log("✅ Trip started, routing to /livedayreturner");
          return navigate("/livedayreturner");
        }

        // Step 4: No trip intent = show button for trip intent
        if (!tripIntentData || !tripIntentData.tripIntentId) {
          console.log("❌ No trip intent, showing button for trip intent");
          console.log("🔍 tripIntentData:", tripIntentData);
          setLoading(false); // Show the button
          return;
        }

        // Step 5: No anchors = show button for anchor selection
        const hasAnchors = anchorLogic && anchorLogic.anchors && anchorLogic.anchors.length > 0;
        if (!hasAnchors) {
          console.log("❌ No anchors, showing button for anchor selection");
          console.log("🔍 anchorLogic:", anchorLogic);
          setLoading(false); // Show the button
          return;
        }

        // Step 6: No itinerary = show button for itinerary build
        if (!itineraryData || !itineraryData.itineraryId) {
          console.log("❌ No itinerary, showing button for itinerary build");
          setLoading(false); // Show the button
          return;
        }

        // Step 7: Itinerary built but trip not started = show button for pre-trip hub
        console.log("✅ Itinerary complete, showing button for pre-trip hub");
        setLoading(false); // Show the button
        return;

      } catch (error) {
        console.error("❌ UniversalRouter error:", error);
        navigate("/access");
      }
    }

    universalRouter();
  }, [navigate, location.pathname, showInitialLoading]);

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

  // No separate "Ready to continue?" screen - always show main loading screen with button below icon

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-300 to-blue-200 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="space-y-6">
            {/* Custom TripWell Logo */}
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
                <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">Welcome back!</h2>
                <p className="text-lg text-sky-50 font-medium drop-shadow-md">🌍 Pick up where you left off!</p>
              </div>
            </div>
          </div>

          {/* Loading spinner - only show during hydration */}
          {!isReady && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {/* Ready button right below the text - always show when loading */}
          {loading && (
            <div className="pt-4">
              <button
                onClick={() => {
                  // Use the same routing logic as the main router
                  const currentTripData = JSON.parse(localStorage.getItem("tripData") || "null");
                  const tripIntentData = JSON.parse(localStorage.getItem("tripIntentData") || "null");
                  const anchorLogic = JSON.parse(localStorage.getItem("anchorLogic") || "null");
                  const itineraryData = JSON.parse(localStorage.getItem("itineraryData") || "null");
                  
                  // Apply the same routing logic
                  if (!currentTripData || !currentTripData.tripId) {
                    navigate("/postprofileroleselect");
                  } else if (currentTripData.tripComplete === true) {
                    navigate("/tripcomplete");
                  } else if (currentTripData.startedTrip === true) {
                    navigate("/livedayreturner");
                  } else if (!tripPersonaData || !tripPersonaData.primaryPersona) {
                    navigate("/trip-persona");
                  } else if (!selectedMetas || selectedMetas.length === 0) {
                    navigate("/meta-select");
                  } else if (!selectedSamples || selectedSamples.length === 0) {
                    navigate("/persona-sample");
                  } else if (!itineraryData || !itineraryData.itineraryId) {
                    navigate("/tripwell/itinerarybuild");
                  } else {
                    navigate("/pretriphub");
                  }
                }}
                className="bg-white text-sky-600 px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:bg-sky-50"
              >
                🚀 Pick up where you left off!
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ALWAYS show the button - no fallbacks, no complex logic
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-300 to-blue-200 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-6">
          {/* Custom TripWell Logo */}
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
              <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">Welcome back!</h2>
              <p className="text-lg text-sky-50 font-medium drop-shadow-md">🌍 Pick up where you left off!</p>
            </div>
          </div>
        </div>

        {/* THE BUTTON - ALWAYS SHOW */}
        <div className="pt-4">
          <button
            onClick={() => {
              // Use the same routing logic as the main router
              const currentTripData = JSON.parse(localStorage.getItem("tripData") || "null");
              const tripIntentData = JSON.parse(localStorage.getItem("tripIntentData") || "null");
              const anchorLogic = JSON.parse(localStorage.getItem("anchorLogic") || "null");
              const itineraryData = JSON.parse(localStorage.getItem("itineraryData") || "null");
              
              // Apply the same routing logic
              if (!currentTripData || !currentTripData.tripId) {
                navigate("/postprofileroleselect");
              } else if (currentTripData.tripComplete === true) {
                navigate("/tripcomplete");
              } else if (currentTripData.startedTrip === true) {
                navigate("/livedayreturner");
              } else if (!tripPersonaData || !tripPersonaData.primaryPersona) {
                navigate("/trip-persona");
              } else if (!selectedMetas || selectedMetas.length === 0) {
                navigate("/meta-select");
              } else if (!selectedSamples || selectedSamples.length === 0) {
                navigate("/persona-sample");
              } else if (!itineraryData || !itineraryData.itineraryId) {
                navigate("/tripwell/itinerarybuild");
              } else {
                navigate("/pretriphub");
              }
            }}
            className="bg-white text-sky-600 px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:bg-sky-50"
          >
            🚀 Pick up where you left off!
          </button>
        </div>
      </div>
    </div>
  ); 
}
