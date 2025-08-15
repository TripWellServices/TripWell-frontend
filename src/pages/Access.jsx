// src/pages/Access.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import BACKEND_URL from "../config";

export default function Access() {
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();

  // Only redirect if user explicitly signs in (not on page load)
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
        console.log("✅ Access flow complete, routing to /localrouter");
        navigate("/localrouter");
        
      } catch (err) {
        console.error("❌ Access flow error", err);
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
    <div className="max-w-md mx-auto p-8 text-center space-y-6">
      <h1 className="text-2xl font-bold">We just need to verify you</h1>
      <p className="text-gray-600">
        Sign in to link your TripWell planning to your account. New here? Sign up takes seconds.
      </p>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handleGoogle}
          className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
        >
          Sign in
        </button>
        <button
          onClick={handleGoogle}
          className="bg-gray-100 text-gray-900 px-5 py-3 rounded-lg hover:bg-gray-200"
        >
          Sign up
        </button>
      </div>

      <div className="text-sm text-gray-600">
        Want to learn more about TripWell?{" "}
        <Link to="/explainer" className="underline">
          See our Explainer
        </Link>
      </div>
    </div>
  );
}
