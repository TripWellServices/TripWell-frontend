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
        const tripData = JSON.parse(localStorage.getItem("tripData") || "null");
        const tripIntentData = JSON.parse(localStorage.getItem("tripIntentData") || "null");
        const anchorSelectData = JSON.parse(localStorage.getItem("anchorSelectData") || "null");
        const itineraryData = JSON.parse(localStorage.getItem("itineraryData") || "null");

        console.log("🔍 Current localStorage state:", {
          userData: !!userData,
          tripData: !!tripData,
          tripIntentData: !!tripIntentData,
          anchorSelectData: !!anchorSelectData,
          itineraryData: !!itineraryData
        });

        // Step 1: Check if we have user data, if not hydrate from backend
        if (!userData) {
          console.log("❌ No userData in localStorage, calling /whoami");

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
          const whoRes = await fetch(`${BACKEND_URL}/tripwell/whoami`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store"
          });

          if (!whoRes.ok) {
            console.log("❌ /whoami failed, routing to /access");
            return navigate("/access");
          }

          const whoData = await whoRes.json();
          const newUserData = {
            firebaseId: whoData.user.firebaseId,
            email: whoData.user.email,
            firstName: whoData.user.firstName,
            lastName: whoData.user.lastName,
            hometownCity: whoData.user.hometownCity,
            state: whoData.user.state
          };

          localStorage.setItem("userData", JSON.stringify(newUserData));
          console.log("💾 Saved userData to localStorage:", newUserData);

          // If user has no profile, route to profile setup
          if (!whoData.user.firstName || !whoData.user.lastName || !whoData.user.hometownCity) {
            console.log("❌ Incomplete profile, routing to /profilesetup");
            return navigate("/profilesetup");
          }

          // If user has no trip, route to trip setup
          if (!whoData.trip?._id) {
            console.log("❌ No trip found, routing to /tripsetup");
            return navigate("/tripsetup");
          }

          // User has trip, hydrate trip data
          const newTripData = {
            tripId: whoData.trip._id,
            tripName: whoData.trip.tripName,
            purpose: whoData.trip.purpose,
            startDate: whoData.trip.startDate,
            endDate: whoData.trip.endDate,
            city: whoData.trip.city,
            joinCode: whoData.trip.joinCode,
            whoWith: whoData.trip.whoWith || [],
            partyCount: whoData.trip.partyCount,
            startedTrip: whoData.trip.startedTrip || false,
            tripComplete: whoData.trip.tripComplete || false
          };

          localStorage.setItem("tripData", JSON.stringify(newTripData));
          console.log("💾 Saved tripData to localStorage:", newTripData);
        }

        // Re-read localStorage after potential updates
        const currentUserData = JSON.parse(localStorage.getItem("userData") || "null");
        const currentTripData = JSON.parse(localStorage.getItem("tripData") || "null");

        // Step 2: Check trip data
        if (!currentTripData || !currentTripData.tripId) {
          console.log("❌ No tripId found, routing to /tripsetup");
          return navigate("/tripsetup");
        }

        // Step 3: Check if trip is complete
        if (currentTripData.tripComplete === true) {
          console.log("✅ Trip is complete, routing to /tripcomplete");
          return navigate("/tripcomplete");
        }

        // Step 4: Check if trip has started
        if (currentTripData.startedTrip === true) {
          console.log("✅ Trip has started, routing to /prephub");
          return navigate("/prephub");
        }

        // Step 5: Check trip intent
        if (!tripIntentData || !tripIntentData.tripIntentId) {
          console.log("❌ No tripIntentId found, routing to /tripintent");
          return navigate("/tripintent");
        }

        // Step 6: Check anchors
        if (!anchorSelectData || !anchorSelectData.anchors || anchorSelectData.anchors.length === 0) {
          console.log("❌ No anchors selected, routing to /anchorselect");
          return navigate("/anchorselect");
        }

        // Step 7: Check itinerary (optional)
        if (!itineraryData || !itineraryData.itineraryId) {
          console.log("❌ No itinerary found, routing to /itinerarybuild");
          return navigate("/itinerarybuild");
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

  return null; // Let the intended route render
}
