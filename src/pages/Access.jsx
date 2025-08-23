// src/pages/Access.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import BACKEND_URL from "../config";

export default function Access() {
  console.log("🚀 Access component mounted");
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();
  const [hasAttemptedSignIn, setHasAttemptedSignIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if we're on a debug route - if so, don't interfere
    const currentPath = window.location.pathname;
    if (currentPath === '/dayindextest') {
      console.log("🚀 On debug route, not interfering:", currentPath);
      setIsCheckingAuth(false);
      return;
    }

    const unsub = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser && !hasAttemptedSignIn) {
        // User is already authenticated - route them to hydrate
        console.log("🔐 User already authenticated on Access page, routing to hydrate...");
        await checkUserAccess(firebaseUser);
      } else if (firebaseUser && hasAttemptedSignIn) {
        // User just signed in - handle the flow
        console.log("🔐 User just signed in, starting localStorage flow...");
        await handleAuthenticatedUser(firebaseUser);
      } else {
        // User is not authenticated - show sign-in options
        console.log("🔐 User not authenticated, showing sign-in options");
        setIsCheckingAuth(false);
      }
    });

    return unsub;
  }, [navigate, hasAttemptedSignIn]);

  const checkUserAccess = async (firebaseUser) => {
    try {
      // Check if this is a new or existing user
      const createRes = await fetch(`${BACKEND_URL}/tripwell/user/createOrFind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseId: firebaseUser.uid,
          email: firebaseUser.email,
        }),
      });

      if (!createRes.ok) {
        throw new Error(`User check failed: ${createRes.status}`);
      }

      const userData = await createRes.json();
      console.log("🔍 User check response:", userData);

      // Simple binary check: does user exist or not?
      if (userData && userData._id) {
        // User exists - go to hydrate
        console.log("💾 Existing user, routing to hydrate...");
        navigate("/hydratelocal");
      } else {
        // No user - go to profile setup
        console.log("👋 New user, routing to profile...");
        navigate("/profilesetup");
      }
      
    } catch (err) {
      console.error("❌ Access check error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleAuthenticatedUser = async (firebaseUser) => {
    try {
      // 1) Create or find the user on backend (unprotected)
      await fetch(`${BACKEND_URL}/tripwell/user/createOrFind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseId: firebaseUser.uid,
          email: firebaseUser.email,
        }),
      });

      // 2) Call hydrate to get all localStorage data
      const token = await firebaseUser.getIdToken(true);
      const hydrateRes = await fetch(`${BACKEND_URL}/tripwell/hydrate`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store"
      });
      
      if (!hydrateRes.ok) {
        throw new Error(`Hydrate failed: ${hydrateRes.status}`);
      }
      
      const localStorageData = await hydrateRes.json();
      console.log("🔍 Hydrate response:", localStorageData);

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

                if (localStorageData.anchorLogicData) {
            localStorage.setItem("anchorLogic", JSON.stringify(localStorageData.anchorLogicData));
            console.log("💾 Saved anchorLogicData to localStorage as anchorLogic:", localStorageData.anchorLogicData);
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
  };

  const handleGoogle = async () => {
    try {
      setHasAttemptedSignIn(true);
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged will handle the rest
    } catch (err) {
      console.error("❌ Google sign-in failed", err);
      if (err.code === 'auth/popup-closed-by-user') {
        // User closed the popup - that's fine, don't show error
        return;
      }
      alert("Authentication error — please try again.");
    }
  };

  // Show loading while checking auth state
  if (isCheckingAuth) {
    return (
      <div className="max-w-md mx-auto p-8 text-center space-y-6">
        <h1 className="text-2xl font-bold">Checking your access...</h1>
        <p className="text-gray-600">Verifying your authentication status</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-8 text-center space-y-6">
      <h1 className="text-2xl font-bold">Who the freak are ya?</h1>
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
