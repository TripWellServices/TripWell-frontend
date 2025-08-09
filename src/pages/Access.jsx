import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import BACKEND_URL from "../config";

export default function Access() {
  const navigate = useNavigate();

  const googleProvider = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Step 1: Create or find user in backend
          await fetch(`${BACKEND_URL}/tripwell/user/createOrFind`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              firebaseId: firebaseUser.uid,
              email: firebaseUser.email,
            }),
          });

          // Step 2: Hydrate user from backend
          const token = await firebaseUser.getIdToken();
          const whoamiRes = await fetch(`${BACKEND_URL}/tripwell/whoami`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!whoamiRes.ok) throw new Error("WhoAmI failed");
          const data = await whoamiRes.json();

          // Step 3: Route logic
          if (!data.tripId) {
            navigate("/tripsetup");
          } else {
            navigate("/tripalreadycreated");
          }
        } catch (err) {
          console.error("❌ Access flow error", err);
        }
      }
    });

    return unsubscribe;
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("❌ Google sign-in failed", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-4">Sign Up or Sign In</h1>
      <button
        onClick={handleGoogleSignIn}
        className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
      >
        Continue with Google
      </button>
    </div>
  );
}
