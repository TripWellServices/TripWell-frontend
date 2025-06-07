import { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const TripContext = createContext();

export const TripProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [trip, setTrip] = useState(null);
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

        // ✅ Get Mongo user
        const userRes = await fetch("https://gofastbackend.onrender.com/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!userRes.ok) throw new Error("Failed to fetch user");
        const userData = await userRes.json();
        setUser(userData);

        // ✅ Get latest trip
        const tripRes = await fetch(`https://gofastbackend.onrender.com/trip/user/${userData._id}/latest`);
        if (!tripRes.ok) throw new Error("Failed to fetch trip");
        const tripData = await tripRes.json();
        setTrip(tripData);
      } catch (err) {
        console.error("❌ TripContext hydration failed:", err);
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
      {children}
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