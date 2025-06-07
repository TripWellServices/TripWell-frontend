import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import useAuthUser from "../hooks/useAuthUser";

export default function Explainer() {
  const { authReady, firebaseUser } = useAuthUser();
  const navigate = useNavigate();

  // 🔁 Redirect to home if already logged in
  useEffect(() => {
    if (authReady && firebaseUser) {
      navigate("/");
    }
  }, [authReady, firebaseUser, navigate]);

  // 🧠 Trigger Google sign-in
  const handleGoogleLogin = async () => {
    try {
      const auth = getAuth();
      await signInWithPopup(auth, new GoogleAuthProvider());
      // Firebase listener will handle the rest
    } catch (err) {
      console.error("Google login failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 bg-white">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">Welcome to TripWell</h1>
      <p className="text-sm text-gray-600 mb-6">Sign in to begin planning your next adventure.</p>
      <button
        onClick={handleGoogleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Sign in with Google
      </button>
    </div>
  );
}
