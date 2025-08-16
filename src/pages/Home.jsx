import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import BACKEND_URL from "../config";
import { useEffect, useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();
  const [hasAttemptedSignIn, setHasAttemptedSignIn] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser || !hasAttemptedSignIn) return; // Only proceed if user just signed in

      try {
        console.log("🔐 User signed in, starting localStorage flow...");
        
        // 1) Create or find the user on backend (unprotected)
        await fetch(`${BACKEND_URL}/tripwell/user/createOrFind`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firebaseId: firebaseUser.uid,
            email: firebaseUser.email,
          }),
        });

        // 2) Call localflush to get all localStorage data
        const token = await firebaseUser.getIdToken(true);
        const flushRes = await fetch(`${BACKEND_URL}/tripwell/localflush`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store"
        });
        
        if (!flushRes.ok) {
          throw new Error(`LocalFlush failed: ${flushRes.status}`);
        }
        
        const localStorageData = await flushRes.json();
        console.log("🔍 LocalFlush response:", localStorageData);

        // 3) Save all data to localStorage
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

        // 4) Route to universal router which will handle all the routing logic
        console.log("✅ Authentication flow complete, routing to /localrouter");
        navigate("/localrouter");
        
      } catch (err) {
        console.error("❌ Authentication flow error", err);
        alert("Something went wrong. Please try again.");
      }
    });

    return unsub;
  }, [navigate, hasAttemptedSignIn]);

  const handleGoogle = async () => {
    try {
      setHasAttemptedSignIn(true);
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged will handle the rest
    } catch (err) {
      console.error("❌ Google sign-in failed", err);
      alert("Authentication error — please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome to TripWell
        </h1>
        <p className="text-lg text-gray-600">
          We're here to help you plan your trip and make memories.
        </p>
        <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
          🚀 Universal localStorage-first routing
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleGoogle}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-lg"
        >
          Sign Up / Sign In with Google
        </button>
      </div>

      <div className="text-center">
        <button
          onClick={() => navigate("/homearchive")}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          ← View Archive Home
        </button>
      </div>
    </div>
  );
}
