import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useEffect, useState } from "react";
import BACKEND_URL from "../config";

export default function Home() {
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();
  const [hasAttemptedSignIn, setHasAttemptedSignIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (firebaseUser) => {
      // If user is already signed in on page load, handle it
      if (firebaseUser && !hasAttemptedSignIn) {
        console.log("🔐 User already signed in, checking access...");
        await checkUserAccess(firebaseUser);
      }
      // If user just signed in via button click, handle it
      else if (firebaseUser && hasAttemptedSignIn) {
        console.log("🔐 User just signed in, checking access...");
        await checkUserAccess(firebaseUser);
      }
      
      setIsCheckingAuth(false);
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
        navigate("/profile");
      }
      
    } catch (err) {
      console.error("❌ Access check error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleGoogle = async () => {
    try {
      setHasAttemptedSignIn(true);
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged will handle the routing
    } catch (err) {
      console.error("❌ Google sign-in failed", err);
      alert("Authentication error — please try again.");
    }
  };

  // Show loading while checking auth state
  if (isCheckingAuth) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome to TripWell
          </h1>
          <p className="text-lg text-gray-600">
            Checking your authentication status...
          </p>
        </div>
      </div>
    );
  }

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
          Sign Up
        </button>
        <button
          onClick={handleGoogle}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-lg"
        >
          Sign In
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
