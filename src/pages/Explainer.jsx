import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function Explainer() {
  const navigate = useNavigate();
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        // Fetch whoami to hydrate mongo user + trip
        try {
          const res = await fetch("/tripwell/whoami");
          const data = await res.json();
          if (data?.trip) {
            navigate("/trip/hub");
          } else {
            navigate("/generalhub"); // or wherever non-trip users go
          }
        } catch (err) {
          console.error("Error during whoami fetch:", err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // user will be picked up by onAuthStateChanged
    } catch (err) {
      console.error("Google login failed:", err);
    }
  };

  if (loading) return <div className="p-10 text-gray-600">Loading...</div>;

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
