// src/pages/Home.jsx
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useEffect, useState } from "react";
import BACKEND_URL from "../config";

export default function Home() {
  const navigate = useNavigate();
  const [hasRouted, setHasRouted] = useState(false);

  useEffect(() => {
    console.log("🔍 Home.jsx starting...");

    console.log("📦 Checking localStorage...");
    const userData = localStorage.getItem("userData");
    const tripData = localStorage.getItem("tripData");
    const profileComplete = localStorage.getItem("profileComplete");
    console.log("📦 localStorage userData:", userData);
    console.log("📦 localStorage tripData:", tripData);
    console.log("📦 localStorage profileComplete:", profileComplete);

    const unsub = auth.onAuthStateChanged(async (firebaseUser) => {
      if (hasRouted) {
        console.log("🚫 Already routed, skipping...");
        return;
      }

      console.log("🔥 Firebase auth state changed:", firebaseUser ? "User found" : "No user");

      if (firebaseUser) {
        console.log("🔐 User authenticated, checking access...");
        setHasRouted(true);
        await checkUserAccess(firebaseUser);
      } else {
        // 👇 Changed: add 2000ms grace period before routing to /access
        console.log("🔐 User not authenticated, starting grace timer...");
        setTimeout(() => {
          if (!auth.currentUser && !hasRouted) {
            console.log("⏳ Still no user after 2000ms → routing to /access");
            setHasRouted(true);
            navigate("/access");
          } else {
            console.log("✅ User appeared during grace period, skipping redirect");
          }
        }, 2000);
      }
    });

    return unsub;
  }, [navigate, hasRouted]);

  const checkUserAccess = async (firebaseUser) => {
    try {
      // /createOrFind is unprotected - no Authorization header needed
      const createRes = await fetch(`${BACKEND_URL}/tripwell/user/createOrFind`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
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

      if (userData && userData._id) {
        console.log("💾 Existing user, routing to hydratelocal...");
        navigate("/hydratelocal");
      } else {
        console.log("👋 New user, routing to profilesetup...");
        navigate("/profilesetup");
      }
    } catch (err) {
      console.error("❌ Access check error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-800">TripWell</h1>
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
