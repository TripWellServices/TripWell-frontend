import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useEffect, useState } from "react";
import BACKEND_URL from "../config";

export default function Home() {
  const navigate = useNavigate();
  const [hasRouted, setHasRouted] = useState(false);
  const [debugInfo, setDebugInfo] = useState("Starting debug...");

  useEffect(() => {
    console.log("🔍 Home.jsx starting...");
    setDebugInfo(prev => prev + "\n🔍 Home.jsx starting...");

    // Check localStorage first
    console.log("📦 Checking localStorage...");
    setDebugInfo(prev => prev + "\n📦 Checking localStorage...");
    
    const userData = localStorage.getItem("userData");
    const tripData = localStorage.getItem("tripData");
    const profileComplete = localStorage.getItem("profileComplete");
    
    console.log("📦 localStorage userData:", userData);
    console.log("📦 localStorage tripData:", tripData);
    console.log("📦 localStorage profileComplete:", profileComplete);
    
    setDebugInfo(prev => prev + "\n📦 localStorage userData: " + (userData ? "EXISTS" : "NULL"));
    setDebugInfo(prev => prev + "\n📦 localStorage tripData: " + (tripData ? "EXISTS" : "NULL"));
    setDebugInfo(prev => prev + "\n📦 localStorage profileComplete: " + profileComplete);

    // Simple auth check - no complicated bypass logic
    const unsub = auth.onAuthStateChanged(async (firebaseUser) => {
      if (hasRouted) {
        console.log("🚫 Already routed, skipping...");
        setDebugInfo(prev => prev + "\n🚫 Already routed, skipping...");
        return;
      }

      console.log("🔥 Firebase auth state changed:", firebaseUser ? "User found" : "No user");
      setDebugInfo(prev => prev + "\n🔥 Firebase auth state changed: " + (firebaseUser ? "User found" : "No user"));

      if (firebaseUser) {
        // User is authenticated - check access and route directly to appropriate page
        console.log("🔐 User authenticated, checking access...");
        setDebugInfo(prev => prev + "\n🔐 User authenticated, checking access...");
        setHasRouted(true);
        
        // DEBUG: Don't actually navigate, just log what we would do
        console.log("🚫 DEBUG MODE: Would call checkUserAccess but not navigating");
        setDebugInfo(prev => prev + "\n🚫 DEBUG MODE: Would call checkUserAccess but not navigating");
        
        // await checkUserAccess(firebaseUser);
      } else {
        // User not authenticated - go to access page for sign-in
        console.log("🔐 User not authenticated, routing to access...");
        setDebugInfo(prev => prev + "\n🔐 User not authenticated, routing to access...");
        setHasRouted(true);
        
        // DEBUG: Don't actually navigate, just log what we would do
        console.log("🚫 DEBUG MODE: Would navigate to /access but not doing it");
        setDebugInfo(prev => prev + "\n🚫 DEBUG MODE: Would navigate to /access but not doing it");
        
        // navigate("/access");
      }
    });

    return unsub;
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

      // Follow dev guide flow logic exactly:
      // ✅ Existing user → Route to /hydratelocal
      // ❌ New user → Route to /profilesetup
      if (userData && userData._id) {
        // User exists - go to hydratelocal (LocalUniversalRouter will handle the rest)
        console.log("💾 Existing user, routing to hydratelocal...");
        navigate("/hydratelocal");
      } else {
        // No user - go to profile setup
        console.log("👋 New user, routing to profilesetup...");
        navigate("/profilesetup");
      }
      
    } catch (err) {
      console.error("❌ Access check error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  // Debug screen - show all the debug info
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-800">
            TripWell - DEBUG MODE
          </h1>
          <p className="text-lg text-gray-600">
            Authentication Debug - Not Navigating
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Debug Log:</h2>
          <pre className="text-sm text-left bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {debugInfo}
          </pre>
        </div>
        
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
}
