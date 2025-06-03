import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ✅ Firebase config (same as Explainer)
const firebaseConfig = {
  apiKey: "AIzaSyCjpoH763y2GH4VDc181IUBaZHqE_ryZ1c",
  authDomain: "gofast-a5f94.firebaseapp.com",
  projectId: "gofast-a5f94",
  storageBucket: "gofast-a5f94.appspot.com",
  messagingSenderId: "500941094498",
  appId: "1:500941094498:web:eee09da6918f9e53889b3b",
  measurementId: "G-L0NGHRBSDE",
};

// ✅ Firebase init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function Login() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      // ✅ Hit backend to complete login
      const response = await axios.post(
        "https://gofastbackend.onrender.com/api/auth/firebase-login",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ✅ Store in localStorage
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("uid", result.user.uid);

      // ✅ Redirect based on presence of tripId
      if (response.data.user.tripId) {
        navigate("/tripwellhub");
      } else {
        navigate("/hub");
      }
    } catch (err) {
      console.error("❌ Google Login failed:", err);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center px-6">
      <h2 className="text-3xl font-semibold mb-4">Welcome Back to TripWell</h2>
      <p className="mb-6 max-w-md">
        Sign in to pick up where you left off.
      </p>

      <button
        onClick={handleGoogleLogin}
        className="bg-blue-600 text-white px-6 py-3 rounded text-lg"
      >
        Sign in with Google
      </button>

      <p className="text-sm text-gray-600 mt-6">Need an account?</p>

      <button
        onClick={() => navigate("/explainer")}
        className="mt-2 underline text-blue-700 text-sm"
      >
        Go to Sign Up
      </button>
    </div>
  );
}