import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  initializeAuth,
} from "firebase/auth";
import { initializeApp } from "firebase/app";
import axios from "axios";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCjpoH763y2GH4VDc181IUBaZHqE_ryZ1c",
  authDomain: "gofast-a5f94.firebaseapp.com",
  projectId: "gofast-a5f94",
  storageBucket: "gofast-a5f94.appspot.com",
  messagingSenderId: "500941094498",
  appId: "1:500941094498:web:eee09da6918f9e53889b3b",
  measurementId: "G-L0NGHRBSDE"
};

// ✅ Firebase init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function Explainer() {
  const navigate = useNavigate();

  // ✅ Redirect if already logged in
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("✅ User already signed in, redirecting...");
        const tripId = localStorage.getItem("activeTripId");
        navigate(tripId ? `/trip/${tripId}` : "/hub");
      }
    });
    return () => unsub();
  }, [navigate]);

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      // ✅ Backend login call
      const response = await axios.post(
        "https://gofastbackend.onrender.com/api/auth/firebase-login",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ User signed in:", response.data.user);

      // 🧠 Save backend user if needed
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("firebaseId", result.user.uid);

      // ✅ Always start at profile
      navigate("/profile");
    } catch (err) {
      console.error("❌ Google Sign-In failed:", err);
      alert("Could not sign in. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center px-6">
      <h2 className="text-3xl font-semibold mb-4">Welcome to TripWell</h2>
      <p className="mb-6 max-w-md">
        We help you plan your trips and execute them with calm, clarity, and confidence.
      </p>

      <button
        onClick={handleGoogleSignUp}
        className="bg-blue-600 text-white px-6 py-3 rounded text-lg"
      >
        Sign In with Google
      </button>

      <p className="text-sm text-gray-600 mt-4">
        Already have an account? You’re in the right place.
      </p>
    </div>
  );
}
