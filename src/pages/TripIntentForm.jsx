// src/pages/TripIntentForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const TripIntentForm = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [intent, setIntent] = useState("");
  const [vibe, setVibe] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/access");
        return;
      }

      try {
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
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) return null;

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
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Trip Intent</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          Intent:
          <input
            type="text"
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            required
            className="border p-2 rounded w-full"
          />
        </label>
        <label className="block">
          Vibe:
          <input
            type="text"
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            required
            className="border p-2 rounded w-full"
          />
        </label>
        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-3 rounded hover:bg-blue-700 transition"
        >
          Save Intent
        </button>
      </form>
    </div>
  );
};

export default TripIntentForm;
