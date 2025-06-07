import { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const TripContext = createContext();

export const TripProvider = ({ children }) => {
  const [user, setUser] = useState(null);     // Mongo user
  const [trip, setTrip] = useState(null);     // TripBase trip
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setTrip(null);
        setLoading(false);
        return;
      }

      try {
        const token = await firebaseUser.getIdToken(true);

        const res = await fetch("https://gofastbackend.onrender.com/tripwell/whoami", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("TripWell whoami fetch failed");

        const { user, trip } = await res.json(); // 🔄 cleaner naming
        setUser(user);
        setTrip(trip);
      } catch (err) {
        console.error("❌ TripContext (TripWell) hydration failed:", err);
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

export const useTripContext = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error("useTripContext must be used within a TripProvider");
  }
  return context;
};
