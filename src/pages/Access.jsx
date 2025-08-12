// src/pages/Access.jsx
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import BACKEND_URL from "../config";

export default function Access() {
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();

  // If the user is already signed in (returning), run backend flow and route
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) return; // no auto-popup; user clicks the button

      try {
        // 1) Create or find the user on backend (unprotected)
        await fetch(`${BACKEND_URL}/tripwell/user/createOrFind`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firebaseId: firebaseUser.uid,
            email: firebaseUser.email,
          }),
        });

        // 2) Hydrate (protected)
        const token = await firebaseUser.getIdToken(true);
        const whoRes = await fetch(`${BACKEND_URL}/tripwell/whoami`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store"
        });
        if (!whoRes.ok) throw new Error(`WhoAmI failed: ${whoRes.status}`);
        const { user, trip } = await whoRes.json();

        // 3) Route: profile completeness -> trip presence -> already created
        const missingProfile = !user?.firstName || !user?.lastName || !user?.hometownCity;
        if (missingProfile) {
          navigate("/profilesetup");
          return;
        }

        if (!trip?._id) {
          navigate("/tripsetup");
          return;
        }

        navigate("/tripalreadycreated");
      } catch (err) {
        console.error("❌ Access flow error", err);
      }
    });

    return unsub;
  }, [navigate]);

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged will handle the rest
    } catch (err) {
      console.error("❌ Google sign-in failed", err);
      alert("Authentication error — please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 text-center space-y-6">
      <h1 className="text-2xl font-bold">We just need to verify you</h1>
      <p className="text-gray-600">
        Sign in to link your TripWell planning to your account. New here? Sign up takes seconds.
      </p>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handleGoogle}
          className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
        >
          Sign in
        </button>
        <button
          onClick={handleGoogle}
          className="bg-gray-100 text-gray-900 px-5 py-3 rounded-lg hover:bg-gray-200"
        >
          Sign up
        </button>
      </div>

      <div className="text-sm text-gray-600">
        Want to learn more about TripWell?{" "}
        <Link to="/explainer" className="underline">
          See our Explainer
        </Link>
      </div>
    </div>
  );
}
