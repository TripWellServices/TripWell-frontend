import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const BACKEND_URL = "https://gofastbackend.onrender.com";

export default function useAuthUser() {
  const [authReady, setAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [mongoUser, setMongoUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();

    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setAuthReady(true); // ✅ Firebase is ready — even if no user

      if (!user) return;

      try {
        const token = await user.getIdToken();

        let res = await fetch(`${BACKEND_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 404) {
          res = await fetch(`${BACKEND_URL}/api/users/init`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: user.displayName,
              email: user.email,
            }),
          });
        }

        const json = await res.json();
        const mongo = json.user || json;

        localStorage.setItem("user", JSON.stringify(mongo));
        setMongoUser(mongo);
      } catch (err) {
        console.error("🔥 Mongo fetch/init failed", err);
        setMongoUser(null);
      }
    });

    return () => unsub();
  }, []);

  return { authReady, firebaseUser, mongoUser };
}