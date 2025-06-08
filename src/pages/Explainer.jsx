import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserAndTrip } from "../services/userService";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";


export default function Explainer() {
  const navigate = useNavigate();
  const { loading, user } = useTripContext();

  useEffect(() => {
    if (!loading && user) {
      navigate("/hub");
    }
  }, [loading, user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // TripContext will pick this up and hydrate
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