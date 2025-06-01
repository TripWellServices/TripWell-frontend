import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function AppInitGate() {
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // 👋 Not logged in
        navigate("/explainer");
      } else {
        // ✅ Logged in, now check backend user state
        const userData = JSON.parse(localStorage.getItem("user"));
        if (userData?.tripId) {
          navigate("/tripwellhub");
        } else {
          navigate("/hub");
        }
      }
    });

    return () => unsub();
  }, [navigate]);

  return null;
}
