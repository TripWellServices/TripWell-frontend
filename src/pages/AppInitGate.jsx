import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const BACKEND_URL = "https://gofastbackend.onrender.com";

export default function AppInitGate() {
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("🧠 Firebase user state:", firebaseUser);

      if (!firebaseUser) {
        console.warn("🚫 No Firebase user — redirecting to /explainer");
        navigate("/explainer");
        return;
      }

      try {
        const token = await firebaseUser.getIdToken();
        console.log("🔐 Firebase token acquired");

        const res = await fetch(`${BACKEND_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let user;
        if (res.status === 404) {
          console.log("🆕 Mongo user not found, creating new user");
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
          console.log("✅ Mongo user found:", user);
        }

        localStorage.setItem("user", JSON.stringify(user));

        if (user.tripId) {
          console.log("🎯 Trip ID found — routing to /tripwellhub");
          navigate("/tripwellhub");
        } else {
          console.log("🛫 No trip ID — routing to /hub");
          navigate("/hub");
        }
      } catch (err) {
        console.error("🔥 Error in AppInitGate:", err);
        navigate("/explainer");
      }
    });

    return () => unsub();
  }, [navigate]);

  return null;
}
