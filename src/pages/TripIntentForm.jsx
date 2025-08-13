import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const TripIntentForm = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [intent, setIntent] = useState("");
  const [vibe, setVibe] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
          navigate("/access");
          return;
        }

        const token = await firebaseUser.getIdToken();
        const res = await fetch(
          "https://gofastbackend.onrender.com/tripwell/whoami",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          navigate("/access");
          return;
        }

        const data = await res.json();
        if (!data?.user?.tripId) {
          navigate("/tripsetup");
          return;
        }

        setUser(data.user);
        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching user:", err);
        navigate("/access");
      }
    };

    fetchUser();
  }, [navigate]);

  // 🚫 Removed the "Standby..." flash — now we render nothing until ready
  if (loading) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(
        "https://gofastbackend.onrender.com/tripwell/intent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tripId: user.tripId,
            intent,
            vibe,
          }),
        }
      );

      if (res.ok) {
        navigate("/tripprebuild");
      } else {
        console.error("❌ Failed to save intent");
      }
    } catch (err) {
      console.error("❌ Error saving intent:", err);
    }
  };

  return (
    <div>
      <h1>Trip Intent</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Intent:
          <input
            type="text"
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            required
          />
        </label>
        <label>
          Vibe:
          <input
            type="text"
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            required
          />
        </label>
        <button type="submit">Save Intent</button>
      </form>
    </div>
  );
};

export default TripIntentForm;
