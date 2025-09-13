// src/pages/Access.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import BACKEND_URL from "../config";
import { getAuthConfig } from "../utils/auth";

// Create provider outside component to avoid recreation
const googleProvider = new GoogleAuthProvider();

export default function Access() {
  console.log("🚀 Access component mounted");
  const navigate = useNavigate();
  const [hasAttemptedSignIn, setHasAttemptedSignIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

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
      // Use the same flow as handleAuthenticatedUser for consistency
      console.log("🔐 User already authenticated, using consistent flow...");
      await handleAuthenticatedUser(firebaseUser);
      
    } catch (err) {
      console.error("❌ Access check error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleAuthenticatedUser = async (firebaseUser) => {
    try {
      // 1) Create or find the user on backend (unprotected)
      const createRes = await fetch(`${BACKEND_URL}/tripwell/user/createOrFind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseId: firebaseUser.uid,
          email: firebaseUser.email,
        }),
      });
      
      if (!createRes.ok) {
        throw new Error(`CreateOrFind failed: ${createRes.status}`);
      }
      
      const createData = await createRes.json();
      console.log("🔍 CreateOrFind response:", createData);
      console.log("🔍 DEBUG - Raw isNewUser from response:", createData.isNewUser);
      console.log("🔍 DEBUG - Type of isNewUser:", typeof createData.isNewUser);

      // 2) SIMPLE FORK: New user vs existing user
      const isNewUser = createData.isNewUser;
      const hasCompleteProfile = createData.profileComplete && createData.firstName && createData.lastName;
      
      console.log("🔍 DEBUG - isNewUser (from backend):", isNewUser);
      console.log("🔍 DEBUG - hasCompleteProfile:", hasCompleteProfile);
      console.log("🔍 DEBUG - profileComplete:", createData.profileComplete);
      console.log("🔍 DEBUG - firstName:", createData.firstName);
      console.log("🔍 DEBUG - lastName:", createData.lastName);
      
      // Add small delay to prevent race conditions
      await new Promise(r => setTimeout(r, 50));
      
      // 🎯 Call Python Main Service for new user signup (if new user)
      if (isNewUser) {
        try {
          console.log(`🎯 Calling Python Main Service for new user: ${createData.email}`);
          
          const pythonResponse = await fetch(`${process.env.REACT_APP_TRIPWELL_AI_BRAIN || 'https://tripwell-ai.onrender.com'}/useactionendpoint`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              user_id: createData._id,
              firebase_id: createData.firebaseId,
              email: createData.email,
              firstName: createData.firstName,
              lastName: createData.lastName,
              profileComplete: createData.profileComplete,
              tripId: createData.tripId,
              funnelStage: createData.funnelStage,
              createdAt: createData.createdAt,
              context: "new_user_signup",
              // Send full user data for Python service
              _id: createData._id,
              firebaseId: createData.firebaseId,
              journeyStage: createData.journeyStage,
              userState: createData.userState
            })
          });

          if (pythonResponse.ok) {
            const pythonData = await pythonResponse.json();
            console.log(`✅ Python Main Service analysis complete for ${createData.email}:`, {
              actions_taken: pythonData.actions_taken?.length || 0,
              user_state: pythonData.user_state
            });
            
            if (pythonData.actions_taken) {
              pythonData.actions_taken.forEach(action => {
                console.log(`  📧 ${action.campaign}: ${action.status} - ${action.reason}`);
              });
            }
          } else {
            console.error(`❌ Python Main Service analysis failed for ${createData.email}`);
          }
        } catch (pythonError) {
          console.error(`❌ Failed to call Python Main Service for ${createData.email}:`, pythonError.message);
        }
      }
      
      if (isNewUser || !hasCompleteProfile) {
        // ❌ New user or incomplete profile - go to profile setup
        console.log("👋 New user or incomplete profile, routing to /profilesetup");
        navigate("/profilesetup");
      } else {
        // ✅ Existing user with complete profile - go to localrouter
        console.log("✅ Existing user with complete profile, routing to /localrouter");
        navigate("/localrouter");
      }
      
    } catch (err) {
      console.error("❌ Access flow error", err);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleGoogle = async () => {
    console.log("🔍 DEBUG: handleGoogle called");
    console.log("🔍 DEBUG: isSigningIn =", isSigningIn);
    console.log("🔍 DEBUG: hasAttemptedSignIn =", hasAttemptedSignIn);
    console.log("🔍 DEBUG: auth.currentUser =", auth.currentUser?.email || "null");
    
    // Prevent multiple simultaneous sign-in attempts
    if (isSigningIn) {
      console.log("🔄 Sign-in already in progress, ignoring click");
      return;
    }

    try {
      console.log("🔍 DEBUG: Setting isSigningIn to true");
      setIsSigningIn(true);
      setHasAttemptedSignIn(true);
      
      console.log("🔐 Starting Google sign-in...");
      console.log("🔍 DEBUG: Google provider config:", googleProvider);
      
      // Configure the Google provider
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log("🔍 DEBUG: About to call signInWithPopup");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("✅ Google sign-in successful:", result.user.email);
      console.log("🔍 DEBUG: Full result object:", result);
      
      // onAuthStateChanged will handle the rest
    } catch (err) {
      console.error("❌ Google sign-in failed", err);
      console.log("🔍 DEBUG: Error code:", err.code);
      console.log("🔍 DEBUG: Error message:", err.message);
      console.log("🔍 DEBUG: Full error object:", err);
      
      // Handle specific error cases
      if (err.code === 'auth/popup-closed-by-user') {
        console.log("ℹ️ User closed the popup - no action needed");
        // User closed the popup - that's fine, don't show error
        return; // Don't show error for normal popup closure
      } else if (err.code === 'auth/cancelled-popup-request') {
        console.log("ℹ️ Popup request was cancelled - no action needed");
        console.log("🔍 DEBUG: This usually means multiple popup attempts or browser blocking");
        // Another popup was opened or cancelled - that's fine
        return; // Don't show error for cancelled popup requests
      } else if (err.code === 'auth/popup-blocked') {
        console.log("⚠️ Popup was blocked by browser");
        alert("Popup was blocked by your browser. Please allow popups for this site and try again.");
      } else if (err.code === 'auth/network-request-failed') {
        console.log("⚠️ Network error during sign-in");
        alert("Network error. Please check your connection and try again.");
      } else {
        console.log("⚠️ Unexpected sign-in error:", err.message);
        alert("Authentication error — please try again.");
      }
    } finally {
      console.log("🔍 DEBUG: Setting isSigningIn to false");
      setIsSigningIn(false);
    }
  };

  // Show loading while checking auth state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h1 className="text-2xl font-bold text-gray-800">Checking your access...</h1>
          <p className="text-gray-600">Verifying your authentication status</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center space-y-8 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
        {/* Logo/Brand Section */}
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Hey there! 👋
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            We're glad you're here! Just sign up so we have a way to securely keep all your trip details.
          </p>
        </div>

        {/* Sign In Section */}
        <div className="space-y-4">
          <button
            onClick={handleGoogle}
            disabled={isSigningIn}
            className={`w-full bg-white border-2 border-gray-200 text-gray-700 px-6 py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 font-medium text-lg group ${
              isSigningIn 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:border-gray-300 hover:shadow-md'
            }`}
          >
            {isSigningIn ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {isSigningIn ? 'Signing in...' : 'Sign up'}
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/80 text-gray-500">or</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 text-center">
            Your credentials might have been removed by your browser so just click the button below to sign back in and pick up where you left off.
          </p>

          <button
            onClick={handleGoogle}
            disabled={isSigningIn}
            className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl transition-all duration-200 font-medium text-lg shadow-lg ${
              isSigningIn 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {isSigningIn ? 'Signing in...' : 'Already a member? Welcome back!'}
          </button>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Want to learn more about TripWell?{" "}
            <Link to="/explainer" className="text-blue-600 hover:text-blue-700 font-medium underline decoration-2 underline-offset-2">
              See our Explainer
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
