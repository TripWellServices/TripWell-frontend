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
        console.log("🔐 User not authenticated, routing to /access");
        setHasRouted(true);
        navigate("/access");
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-6">
          {/* Custom TripWell Logo */}
          <div className="flex flex-col items-center space-y-4">
            <svg 
              width="120" 
              height="120" 
              viewBox="0 0 120 120" 
              className="drop-shadow-lg"
            >
              {/* Globe Background */}
              <circle 
                cx="60" 
                cy="60" 
                r="50" 
                fill="url(#globeGradient)" 
                stroke="#1e40af" 
                strokeWidth="2"
              />
              
              {/* Globe Lines */}
              <path 
                d="M 10 60 Q 60 10 110 60 Q 60 110 10 60" 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="1.5" 
                opacity="0.6"
              />
              <path 
                d="M 10 60 Q 60 110 110 60" 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="1.5" 
                opacity="0.6"
              />
              <line x1="10" y1="60" x2="110" y2="60" stroke="#3b82f6" strokeWidth="1.5" opacity="0.6"/>
              
              {/* Plane */}
              <g transform="translate(60, 60) rotate(-15)">
                {/* Plane Body */}
                <ellipse cx="0" cy="0" rx="25" ry="8" fill="#ef4444" stroke="#dc2626" strokeWidth="1"/>
                
                {/* Plane Wings */}
                <path 
                  d="M -15 -5 L -25 -15 L -20 -15 L -10 -5 Z" 
                  fill="#ef4444" 
                  stroke="#dc2626" 
                  strokeWidth="1"
                />
                <path 
                  d="M -15 5 L -25 15 L -20 15 L -10 5 Z" 
                  fill="#ef4444" 
                  stroke="#dc2626" 
                  strokeWidth="1"
                />
                
                {/* Plane Tail */}
                <path 
                  d="M 15 -3 L 25 -8 L 25 -5 L 18 -3 Z" 
                  fill="#ef4444" 
                  stroke="#dc2626" 
                  strokeWidth="1"
                />
                <path 
                  d="M 15 3 L 25 8 L 25 5 L 18 3 Z" 
                  fill="#ef4444" 
                  stroke="#dc2626" 
                  strokeWidth="1"
                />
                
                {/* Plane Windows */}
                <circle cx="-8" cy="-2" r="1.5" fill="#ffffff"/>
                <circle cx="-2" cy="-2" r="1.5" fill="#ffffff"/>
                <circle cx="4" cy="-2" r="1.5" fill="#ffffff"/>
              </g>
              
              {/* Gradients */}
              <defs>
                <linearGradient id="globeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#dbeafe"/>
                  <stop offset="100%" stopColor="#bfdbfe"/>
                </linearGradient>
              </defs>
            </svg>
            
            {/* TripWell Text */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                <span className="text-blue-600">Trip</span>
                <span className="text-indigo-600">Well</span>
              </h1>
              <p className="text-lg text-gray-600 font-medium">
                Your AI-powered travel companion
              </p>
            </div>
          </div>
        </div>

        {/* Loading spinner */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
}
