import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";

export default function Access() {
  const navigate = useNavigate();

  // Run auth flow on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) return; // Stay on page if no auth yet

      try {
        const token = await firebaseUser.getIdToken();

        // Step 1: Create or find backend user (unprotected route)
        const createRes = await fetch(
          "https://gofastbackend.onrender.com/tripwell/user/createOrFind",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              firebaseId: firebaseUser.uid,
              email: firebaseUser.email,
            }),
          }
        );
        if (!createRes.ok) throw new Error("Failed to create/find user");

        // Step 2: Hydrate user via whoami (protected route)
        const whoamiRes = await fetch(
          "https://gofastbackend.onrender.com/tripwell/whoami",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!whoamiRes.ok) throw new Error("Failed to hydrate user");

        const userData = await whoamiRes.json();

        // Step 3: Routing decisions
        if (!userData.firstName || !userData.lastName || !userData.hometownCity) {
          navigate("/profilesetup");
        } else if (!userData.tripId) {
          navigate("/tripsetup");
        } else {
          navigate("/tripalreadycreated");
        }
      } catch (err) {
        console.error("❌ Access flow failed:", err);
      }
    });

    return unsubscribe;
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Google sign-in failed:", err);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6 text-center">
      <h1 className="text-2xl font-bold">Sign Up or Sign In</h1>
      <p className="text-gray-600">
        Use your email to create a new account or log into your existing TripWell profile.
      </p>

      <button
        onClick={handleGoogleSignIn}
        className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Continue with Google
      </button>
    </div>
  );
}
