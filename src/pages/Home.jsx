import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useEffect, useState } from "react";
import BACKEND_URL from "../config";

export default function Home() {
  const navigate = useNavigate();
  const [hasRouted, setHasRouted] = useState(false);

  useEffect(() => {
    // Show splash screen for 200ms
    const timer = setTimeout(() => {
      // Then check auth state and route appropriately
      const unsub = auth.onAuthStateChanged(async (firebaseUser) => {
        if (hasRouted) return; // Prevent multiple routing attempts
        
        if (firebaseUser) {
          // User is authenticated - check access and route
          console.log("🔐 User authenticated, checking access...");
          setHasRouted(true);
          await checkUserAccess(firebaseUser);
        } else {
          // User not authenticated - go to access page
          console.log("🔐 User not authenticated, routing to access...");
          setHasRouted(true);
          navigate("/access");
        }
      });

      return () => unsub();
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
        navigate("/profile");
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
            Welcome to TripWell!
          </h1>
          <p className="text-xl text-gray-600">
            We're here to create memories for you.
          </p>
        </div>
        
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">🚀</span>
          </div>
        </div>
      </div>
    </div>
  );
}
