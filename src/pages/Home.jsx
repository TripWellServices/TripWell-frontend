import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useEffect, useState } from "react";
import BACKEND_URL from "../config";

export default function Home() {
  const navigate = useNavigate();
  const [hasRouted, setHasRouted] = useState(false);

  useEffect(() => {
    // Check if we're already on a live day route or debug route - if so, don't interfere
    const currentPath = window.location.pathname;
    console.log("🔍 Home.jsx checking path:", currentPath);
    
    const bypassPaths = [
      '/tripliveday',
      '/tripliveblock', 
      '/dayindextest',
      '/livedayreturner',
      '/tripdaylookback',
      '/access',  // Don't interfere if already on access page
      '/profilesetup',
      '/hydratelocal'
    ];
    
    const shouldBypass = bypassPaths.some(path => currentPath.startsWith(path) || currentPath === path);
    
    console.log("🔍 Should bypass:", shouldBypass, "for path:", currentPath);
    
    if (shouldBypass) {
      console.log("🚀 Already on protected route, not interfering:", currentPath);
      return;
    }
    
    console.log("🔍 Proceeding with normal routing logic...");

    // Show splash screen for 1000ms
    const timer = setTimeout(async () => {
      if (hasRouted) return; // Prevent multiple routing attempts
      
      try {
        // Wait for Firebase auth to be ready (CRITICAL PATTERN FROM DEV GUIDE)
        const firebaseUser = await new Promise(resolve => {
          const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe();
            resolve(user);
          });
        });

        if (firebaseUser) {
          // User is authenticated - check access and route
          console.log("🔐 User authenticated, checking access...");
          setHasRouted(true);
          await checkUserAccess(firebaseUser);
        } else {
          // User not authenticated - go to access page for sign-in
          console.log("🔐 User not authenticated, routing to access...");
          setHasRouted(true);
          navigate("/access");
        }
      } catch (error) {
        console.error("❌ Auth check error:", error);
        setHasRouted(true);
        navigate("/access");
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [navigate, hasRouted]);

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

  // Pure splash screen - no buttons, no interactions
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-800">
            TripWell
          </h1>
          <p className="text-lg text-gray-600">
            Your AI-powered travel companion
          </p>
        </div>
        
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
}
