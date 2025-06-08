import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const TripContext = createContext();

export const TripProvider = ({ children }) => {
  const [user, setUser] = useState(null);     // Mongo user
  const [trip, setTrip] = useState(null);     // TripBase trip
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        console.warn("⚠️ No Firebase user.");
        setUser(null);
        setTrip(null);
        setLoading(false);
        return;
      }

      try {
        const token = await firebaseUser.getIdToken(true);

        const res = await fetch("https://gofastbackend.onrender.com/tripwell/whoami", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("❌ Failed to fetch /tripwell/whoami");
        }

        const { user, trip } = await res.json();
        setUser(user);
        setTrip(trip);
      } catch (err) {
        console.error("💥 TripContext hydration failed:", err);
        setUser(null);
        setTrip(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <TripContext.Provider value={{ user, trip, loading }}>
      {loading ? <div>Loading...</div> : children}
    </TripContext.Provider>
  );
};

export const useTripContext = () => useContext(TripContext);
