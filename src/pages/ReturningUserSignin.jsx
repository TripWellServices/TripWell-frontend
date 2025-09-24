// src/pages/ReturningUserSignin.jsx
// 🎯 RETURNING USER SIGN IN - Handle Firebase auth and route to ProfileSetup
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import BACKEND_URL from "../config";

const googleProvider = new GoogleAuthProvider();

export default function ReturningUserSignin() {
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    if (isSigningIn) return;
    
    setIsSigningIn(true);
    try {
      console.log("🚀 Starting auth process...");
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      console.log("🔐 User signed in:", user.email);
      
      // Create or find user in backend
      console.log("🔍 Calling createOrFind...");
      const res = await fetch(`${BACKEND_URL}/tripwell/user/createOrFind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseId: user.uid,
          email: user.email,
        }),
      });
      
      const userData = await res.json();
      console.log("🔍 Backend response:", userData);
      
      // Save user data to localStorage
      if (userData.user) {
        localStorage.setItem("userData", JSON.stringify(userData.user));
        console.log("💾 Saved user data to localStorage");
      }
      
      // Route to LocalRouter (existing user)
      console.log("✅ Auth success → LocalRouter");
      navigate("/localrouter");
      
    } catch (error) {
      console.error("❌ Sign in failed:", error);
    } finally {
      setIsSigningIn(false);
    }
  };

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
            Welcome Back! 👋
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Sign in to continue planning your adventures
          </p>
        </div>

        {/* Sign In Button */}
        <div className="space-y-4">
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningIn ? "Signing in..." : "🔐 Sign In with Google"}
          </button>
        </div>

        {/* Help Text */}
        <div className="text-sm text-gray-500">
          <p>Sign in to access your personalized trip planning experience</p>
        </div>
      </div>
    </div>
  );
}
