import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import BACKEND_URL from "../config";
import { fetchJSON } from "../utils/fetchJSON";

export default function TripIDTest() {
  const [tripId, setTripId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function hydrateTripId() {
      try {
        // ✅ Wait until Firebase is ready
        await new Promise(resolve => {
          const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe();
            resolve(user);
          });
        });

        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
          console.error("❌ No Firebase user after waiting");
          setTripId("No Firebase user");
          return;
        }

        const token = await firebaseUser.getIdToken();

        const data = await fetchJSON(`${BACKEND_URL}/tripwell/whoami`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store"
        });

        console.log("WHOAMI RESPONSE:", data);
        setTripId(data?.user?.tripId || "No tripId found");
      } catch (err) {
        console.error("Error fetching tripId", err);
        setTripId("Error");
      } finally {
        setLoading(false);
      }
    }

    hydrateTripId();
  }, []);

  if (loading) return <div>Loading tripId...</div>;

  return (
    <div>
      <h1>TripID Test</h1>
      <p>Trip ID: {tripId}</p>
    </div>
  );
}
