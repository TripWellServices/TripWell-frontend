import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import BACKEND_URL from "../config";

export default function LocalFlusherRoute() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function flushFromBackend() {
      try {
        setStatus("🔍 Checking Firebase auth...");
        
        // Wait for Firebase auth
        await new Promise(resolve => {
          const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe();
            resolve(user);
          });
        });

        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
          setStatus("❌ No Firebase user found");
          setTimeout(() => navigate("/access"), 2000);
          return;
        }

        setStatus("🔍 Calling /whoami to get user data...");
        const token = await firebaseUser.getIdToken();
        const whoRes = await fetch(`${BACKEND_URL}/tripwell/whoami`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store"
        });

        if (!whoRes.ok) {
          setStatus("❌ /whoami failed - user may not exist");
          setTimeout(() => navigate("/access"), 2000);
          return;
        }

        const whoData = await whoRes.json();
        console.log("🔍 /whoami response:", whoData);

        // Flush userData
        setStatus("💾 Flushing userData...");
        const userData = {
          firebaseId: whoData.user.firebaseId,
          email: whoData.user.email,
          firstName: whoData.user.firstName,
          lastName: whoData.user.lastName,
          hometownCity: whoData.user.hometownCity,
          state: whoData.user.state
        };
        localStorage.setItem("userData", JSON.stringify(userData));
        console.log("💾 Flushed userData:", userData);

        // Check if user has a trip
        if (!whoData.trip?._id) {
          setStatus("❌ No trip found in backend");
          setTimeout(() => navigate("/tripsetup"), 2000);
          return;
        }

        // Flush tripData
        setStatus("💾 Flushing tripData...");
        const tripData = {
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
        localStorage.setItem("tripData", JSON.stringify(tripData));
        console.log("💾 Flushed tripData:", tripData);

        // Try to flush tripIntentData
        setStatus("🔍 Checking for trip intent...");
        try {
          const intentRes = await fetch(`${BACKEND_URL}/tripwell/tripintent/${tripData.tripId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (intentRes.ok) {
            const intentData = await intentRes.json();
            setStatus("💾 Flushing tripIntentData...");
            const tripIntentData = {
              tripIntentId: intentData._id,
              priorities: intentData.priorities ? intentData.priorities.split(',') : [],
              vibes: intentData.vibes ? intentData.vibes.split(',') : [],
              budget: intentData.budget || ""
            };
            localStorage.setItem("tripIntentData", JSON.stringify(tripIntentData));
            console.log("💾 Flushed tripIntentData:", tripIntentData);
          } else {
            console.log("ℹ️ No trip intent found in backend");
          }
        } catch (err) {
          console.log("ℹ️ Could not fetch trip intent:", err);
        }

        // Try to flush anchorSelectData
        setStatus("🔍 Checking for anchor selections...");
        try {
          const anchorRes = await fetch(`${BACKEND_URL}/tripwell/anchorlogic/${tripData.tripId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (anchorRes.ok) {
            const anchorData = await anchorRes.json();
            setStatus("💾 Flushing anchorSelectData...");
            const anchorSelectData = {
              anchors: anchorData.anchorTitles || []
            };
            localStorage.setItem("anchorSelectData", JSON.stringify(anchorSelectData));
            console.log("💾 Flushed anchorSelectData:", anchorSelectData);
          } else {
            console.log("ℹ️ No anchor selections found in backend");
          }
        } catch (err) {
          console.log("ℹ️ Could not fetch anchor selections:", err);
        }

        // Try to flush itineraryData
        setStatus("🔍 Checking for itinerary...");
        try {
          const itineraryRes = await fetch(`${BACKEND_URL}/tripwell/itinerary/days/${tripData.tripId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (itineraryRes.ok) {
            const itineraryDays = await itineraryRes.json();
            setStatus("💾 Flushing itineraryData...");
            const itineraryData = {
              itineraryId: "flushed-from-backend",
              days: itineraryDays.map(day => ({
                dayIndex: day.dayIndex,
                summary: day.summary
              }))
            };
            localStorage.setItem("itineraryData", JSON.stringify(itineraryData));
            console.log("💾 Flushed itineraryData:", itineraryData);
          } else {
            console.log("ℹ️ No itinerary found in backend");
          }
        } catch (err) {
          console.log("ℹ️ Could not fetch itinerary:", err);
        }

        setStatus("✅ Flush complete! Redirecting to universal router...");
        console.log("✅ LocalStorage flush complete");
        
        // Redirect to universal router to handle routing
        setTimeout(() => navigate("/localrouter"), 1000);

      } catch (error) {
        console.error("❌ Flush error:", error);
        setStatus("❌ Flush failed: " + error.message);
        setTimeout(() => navigate("/access"), 3000);
      } finally {
        setLoading(false);
      }
    }

    flushFromBackend();
  }, [navigate]);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">
          🔄 LocalStorage Flusher
        </h1>
        <p className="text-gray-600">
          Syncing your data from the backend to localStorage
        </p>
      </div>

      <div className="bg-blue-50 rounded-lg p-6">
        <div className="text-center space-y-4">
          {loading ? (
            <div className="animate-pulse">
              <div className="text-lg font-semibold text-blue-800">{status}</div>
              <div className="text-sm text-blue-600">Please wait...</div>
            </div>
          ) : (
            <div>
              <div className="text-lg font-semibold text-green-800">{status}</div>
              <div className="text-sm text-green-600">Redirecting...</div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => navigate("/")}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          ← Back to Main App
        </button>
      </div>
    </div>
  );
}
