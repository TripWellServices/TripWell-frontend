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
              {/* Globe */}
              <circle 
                cx="60" 
                cy="60" 
                r="45" 
                fill="#e0f2fe" 
                stroke="#0284c7" 
                strokeWidth="2"
              />
              
              {/* Globe Lines */}
              <path 
                d="M 15 60 Q 60 15 105 60 Q 60 105 15 60" 
                fill="none" 
                stroke="#0284c7" 
                strokeWidth="1.5" 
                opacity="0.7"
              />
              <path 
                d="M 15 60 Q 60 105 105 60" 
                fill="none" 
                stroke="#0284c7" 
                strokeWidth="1.5" 
                opacity="0.7"
              />
              <line x1="15" y1="60" x2="105" y2="60" stroke="#0284c7" strokeWidth="1.5" opacity="0.7"/>
              
              {/* Plane - Simple and Clean */}
              <g transform="translate(60, 60) rotate(-20)">
                {/* Plane Body */}
                <rect x="-20" y="-3" width="40" height="6" rx="3" fill="#ef4444" stroke="#dc2626" strokeWidth="1"/>
                
                {/* Plane Wings */}
                <path 
                  d="M -15 -3 L -25 -12 L -20 -12 L -10 -3 Z" 
                  fill="#ef4444" 
                  stroke="#dc2626" 
                  strokeWidth="1"
                />
                <path 
                  d="M -15 3 L -25 12 L -20 12 L -10 3 Z" 
                  fill="#ef4444" 
                  stroke="#dc2626" 
                  strokeWidth="1"
                />
                
                {/* Plane Tail */}
                <path 
                  d="M 15 -2 L 22 -8 L 22 -4 L 18 -2 Z" 
                  fill="#ef4444" 
                  stroke="#dc2626" 
                  strokeWidth="1"
                />
                <path 
                  d="M 15 2 L 22 8 L 22 4 L 18 2 Z" 
                  fill="#ef4444" 
                  stroke="#dc2626" 
                  strokeWidth="1"
                />
                
                {/* Plane Windows */}
                <circle cx="-8" cy="0" r="1.5" fill="#ffffff"/>
                <circle cx="-2" cy="0" r="1.5" fill="#ffffff"/>
                <circle cx="4" cy="0" r="1.5" fill="#ffffff"/>
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
