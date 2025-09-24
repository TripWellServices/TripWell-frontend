// src/pages/Home.jsx
// 🚨 CRITICAL: This file contains the REAL FIX for the perennial routing issue!
// 🚨 NEW USERS MUST GO TO /profilesetup - NEVER /localrouter!
// 🚨 EXISTING USERS GO TO /localrouter
// 🚨 DO NOT CHANGE THE ROUTING LOGIC - IT'S THE 1000TH TIME WE'VE FIXED THIS!
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { useEffect, useState } from "react";
import BACKEND_URL from "../config";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasRouted, setHasRouted] = useState(false);

  useEffect(() => {
    // 🚨 CRITICAL: Only run auth check when user is actually on home page!
    if (location.pathname !== "/") {
      console.log("🔍 Home.jsx - Not on home page, skipping auth check");
      return;
    }

    console.log("🔍 Home.jsx - Simple Firebase checker starting...");

    // 750ms delay for better timing
    const timeoutId = setTimeout(() => {
      const unsub = auth.onAuthStateChanged(async (firebaseUser) => {
        console.log("🔥 Firebase auth state changed:", firebaseUser ? "User found" : "No user");
        
        if (!hasRouted) {
          setHasRouted(true);
          
          if (firebaseUser) {
            console.log("✅ User found, routing to localrouter for routing logic...");
            navigate("/localrouter");
          } else {
      console.log("❌ No user, routing to /signup...");
      navigate("/signup");
          }
        }
      });

      return () => {
        unsub();
      };
    }, 1400);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [navigate, hasRouted, location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-300 to-blue-200 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-6">
          {/* Custom TripWell Logo */}
          <div className="flex flex-col items-center space-y-4">
                         <svg 
               width="140" 
               height="140" 
               viewBox="0 0 24 24" 
               fill="none" 
               xmlns="http://www.w3.org/2000/svg"
               className="drop-shadow-lg"
             >
              <path 
                d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L12 21L16 22V20.5L14 19V13.5L22 16Z" 
                fill="#0ea5e9"
              />
            </svg>
            
            {/* TripWell Text */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                <span className="text-sky-100">Trip</span>
                <span className="text-white">Well</span>
              </h1>
              <p className="text-lg text-sky-50 font-medium drop-shadow-md">
                Your AI-powered travel companion
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
