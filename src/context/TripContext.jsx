import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase"; // 🔐 Your source-of-truth auth
import { useNavigate } from "react-router-dom";

const TripContext = createContext();

export const TripProvider = ({ children }) => {
  const [user, setUser] = useState(null);     // Mongo user
  const [trip, setTrip] = useState(null);     // TripBase trip
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const hydrate = async () => {
      try {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
          console.warn("⚠️ No Firebase user. Redirecting to explainer.");
          setUser(null);
          setTrip(null);
          setLoading(false);
          navigate("/explainer");
          return;
        }

        const token = await firebaseUser.getIdToken(true);

        const res = await fetch("https://gofastbackend.onrender.com/tripwell/whoami", {
          method: "POST", // 🔁 unified identity handshake
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
          cache: "no-store", // 🚫 no 304s allowed
        });

        if (!res.ok) throw new Error(`❌ whoami failed: ${res.status}`);

        const { user, trip } = await res.json();

        setUser(user);
        setTrip(trip);

        // 🧭 Routing logic override — full redirect control
        if (!user) {
          navigate("/explainer");
        } else if (!trip) {
          navigate("/generalhub");
        } else {
          navigate("/trip/hub");
        }

      } catch (err) {
        console.error("💥 TripContext hydration failed:", err);
        setUser(null);
        setTrip(null);
        navigate("/explainer"); // fallback if all else breaks
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, [navigate]);

  return (
    <TripContext.Provider value={{ user, trip, loading }}>
      {loading ? <div className="h-screen flex justify-center items-center">Loading TripWell...</div> : children}
    </TripContext.Provider>
  );
};

export const useTripContext = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error("useTripContext must be used within a TripProvider");
  }
  return context;
};
