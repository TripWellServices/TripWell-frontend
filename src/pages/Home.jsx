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

    // Always wait 1900ms before routing
    const timeoutId = setTimeout(() => {
      if (!hasRouted) {
        console.log("⏰ 1900ms reached, routing based on auth state...");
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
            }, 1900);

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

        {/* Loading spinner - always show for 2000ms */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    </div>
  );
}
