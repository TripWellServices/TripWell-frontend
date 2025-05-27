import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function UserStateGate() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();

    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const token = await user.getIdToken();

        const res = await axios.get("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const tripId = res.data.user.tripId;

        if (tripId) {
          navigate(`/trip/${tripId}`);
        } else {
          navigate("/hub");
        }
      } catch (err) {
        console.error("Failed to load user state:", err);
        navigate("/hub"); // fallback
      } finally {
        setLoading(false);
      }
    });
  }, []);

  if (loading) {
    return <div className="p-6">Loading your travel state...</div>;
  }

  return null; // nothing renders here — it just redirects
}
