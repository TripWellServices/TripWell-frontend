// src/pages/Access.jsx
// 🚨 CRITICAL: This file is for EXPLICIT /access route only!
// 🚨 The REAL routing fix is in Home.jsx - this is just for when users go to /access directly!
// 🚨 DO NOT CHANGE THE ROUTING LOGIC - IT'S THE 1000TH TIME WE'VE FIXED THIS!
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import BACKEND_URL from "../config";

const googleProvider = new GoogleAuthProvider();

export default function Access() {
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [hasProcessedAuth, setHasProcessedAuth] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  



  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-300 to-blue-200 flex items-center justify-center p-4">
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
            onClick={async () => {
              if (isSigningIn || hasProcessedAuth || isRouting) {
                console.log("🚫 Already processing, ignoring click");
                return;
              }
              
              try {
                setIsSigningIn(true);
                setHasProcessedAuth(true);
                setIsRouting(true);
                console.log("🚀 Starting auth process...");
                
                // 1) Sign in with Firebase
                const result = await signInWithPopup(auth, googleProvider);
                console.log("🔐 User signed in:", result.user.email);
                
                // 2) Check MongoDB - create or find user (ONLY ONCE!)
                console.log("🔍 Calling createOrFind...");
                const res = await fetch(`${BACKEND_URL}/tripwell/user/createOrFind`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    firebaseId: result.user.uid,
                    email: result.user.email,
                  }),
                });
                
                const userData = await res.json();
                console.log("🔍 Backend response:", userData);
                
                // 🚨 CRITICAL: Wait for all states to finalize before routing
                console.log("⏳ Waiting 500ms for all states to finalize...");
                await new Promise(resolve => setTimeout(resolve, 500));
                
                console.log("🔒 Routing decision in progress...");
                
                // 🚨 CRITICAL ROUTING LOGIC - DO NOT CHANGE!
                // 3) Route based on response
                if (userData.userCreated) {
                  console.log("👋 User created → /profilesetup");
                  navigate("/profilesetup");  // NEW USER - skip localrouter entirely!
                } else {
                  console.log("✅ User found → /localrouter");
                  navigate("/localrouter");   // EXISTING USER - go to localrouter
                }
                
              } catch (err) {
                console.error("❌ Error:", err);
                if (err.code !== 'auth/popup-closed-by-user') {
                  alert("Authentication error — please try again.");
                }
                // Reset flags on error
                setHasProcessedAuth(false);
                setIsRouting(false);
              } finally {
                setIsSigningIn(false);
              }
            }}
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
            onClick={async () => {
              if (isSigningIn || hasProcessedAuth || isRouting) {
                console.log("🚫 Already processing, ignoring click");
                return;
              }
              
              try {
                setIsSigningIn(true);
                setHasProcessedAuth(true);
                setIsRouting(true);
                console.log("🚀 Starting auth process...");
                
                // 1) Sign in with Firebase
                const result = await signInWithPopup(auth, googleProvider);
                console.log("🔐 User signed in:", result.user.email);
                
                // 2) Check MongoDB - create or find user (ONLY ONCE!)
                console.log("🔍 Calling createOrFind...");
                const res = await fetch(`${BACKEND_URL}/tripwell/user/createOrFind`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    firebaseId: result.user.uid,
                    email: result.user.email,
                  }),
                });
                
                const userData = await res.json();
                console.log("🔍 Backend response:", userData);
                
                // 🚨 CRITICAL: Wait for all states to finalize before routing
                console.log("⏳ Waiting 500ms for all states to finalize...");
                await new Promise(resolve => setTimeout(resolve, 500));
                
                console.log("🔒 Routing decision in progress...");
                
                // 🚨 CRITICAL ROUTING LOGIC - DO NOT CHANGE!
                // 3) Route based on response
                if (userData.userCreated) {
                  console.log("👋 User created → /profilesetup");
                  navigate("/profilesetup");  // NEW USER - skip localrouter entirely!
                } else {
                  console.log("✅ User found → /localrouter");
                  navigate("/localrouter");   // EXISTING USER - go to localrouter
                }
                
              } catch (err) {
                console.error("❌ Error:", err);
                if (err.code !== 'auth/popup-closed-by-user') {
                  alert("Authentication error — please try again.");
                }
                // Reset flags on error
                setHasProcessedAuth(false);
                setIsRouting(false);
              } finally {
                setIsSigningIn(false);
              }
            }}
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
