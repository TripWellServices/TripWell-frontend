import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const BACKEND_URL = "https://gofastbackend.onrender.com";

export default function AppInitGate() {
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/explainer");
        return;
      }

      try {
        const token = await firebaseUser.getIdToken();

        // Step 1: Check if user exists in Mongo
        const res = await fetch(`${BACKEND_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let user;
        if (res.status === 404) {
          // Step 2: If not, create user with init
          const createRes = await fetch(`${BACKEND_URL}/api/users/init`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: firebaseUser.displayName,
              email: firebaseUser.email,
            }),
          });

          user = await createRes.json();
        } else {
          const json = await res.json();
          user = json.user || json;
        }

        // Step 3: Save user to localStorage
        localStorage.setItem("user", JSON.stringify(user));

        // Step 4: Route based on trip state
        if (user.tripId) {
          navigate("/tripwellhub");
        } else {
          navigate("/hub");
        }
      } catch (err) {
        console.error("🔥 AppInitGate error:", err);
        navigate("/explainer");
      }
    });

    return () => unsub();
  }, [navigate]);

  return null; // Nothing visual, just logic
}
