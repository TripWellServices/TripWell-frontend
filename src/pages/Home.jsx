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

    // Always wait 2225ms before routing
    const timeoutId = setTimeout(() => {
      if (!hasRouted) {
        console.log("⏰ 2225ms reached, routing based on auth state...");
        setHasRouted(true);
        
        const currentUser = auth.currentUser;
        if (currentUser) {
          console.log("⏰ User found, routing to hydratelocal...");
          navigate("/hydratelocal");
        } else {
          console.log("⏰ No user, routing to /access...");
          navigate("/access");
        }
      }
    }, 2225);

    const unsub = auth.onAuthStateChanged(async (firebaseUser) => {
      console.log("🔥 Firebase auth state changed:", firebaseUser ? "User found" : "No user");
      // Don't route immediately - let the 2000ms timeout handle it
    });

    return () => {
      clearTimeout(timeoutId);
      unsub();
    };
  }, [navigate, hasRouted]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
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
              {/* Simple Plane */}
              <g transform="translate(60, 60) rotate(-15)">
                {/* Plane Body */}
                <rect x="-25" y="-4" width="50" height="8" rx="4" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1"/>
                
                {/* Plane Wings */}
                <path 
                  d="M -20 -4 L -35 -18 L -30 -18 L -15 -4 Z" 
                  fill="#3b82f6" 
                  stroke="#1d4ed8" 
                  strokeWidth="1"
                />
                <path 
                  d="M -20 4 L -35 18 L -30 18 L -15 4 Z" 
                  fill="#3b82f6" 
                  stroke="#1d4ed8" 
                  strokeWidth="1"
                />
                
                {/* Plane Tail */}
                <path 
                  d="M 20 -3 L 30 -12 L 30 -8 L 25 -3 Z" 
                  fill="#3b82f6" 
                  stroke="#1d4ed8" 
                  strokeWidth="1"
                />
                <path 
                  d="M 20 3 L 30 12 L 30 8 L 25 3 Z" 
                  fill="#3b82f6" 
                  stroke="#1d4ed8" 
                  strokeWidth="1"
                />
                
                {/* Plane Windows */}
                <circle cx="-10" cy="0" r="2" fill="#ffffff"/>
                <circle cx="-2" cy="0" r="2" fill="#ffffff"/>
                <circle cx="6" cy="0" r="2" fill="#ffffff"/>
                <circle cx="14" cy="0" r="2" fill="#ffffff"/>
              </g>
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

        {/* Loading spinner - always show for 2000ms */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
}
