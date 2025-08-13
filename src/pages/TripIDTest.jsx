// src/pages/TripIDTest.jsx
import React, { useEffect, useState } from "react";
import { auth } from "../firebase";

export default function TripIDTest() {
  const [tripId, setTripId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTripId = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch("https://gofastbackend.onrender.com/tripwell/whoami", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        console.log("WHOAMI RESPONSE:", data);
        if (data?.user?.tripId) {
          setTripId(data.user.tripId);
        } else {
          setTripId("No tripId found");
        }
      } catch (err) {
        console.error("Error fetching tripId", err);
        setTripId("Error");
      } finally {
        setLoading(false);
      }
    };

    fetchTripId();
  }, []);

  if (loading) return <div>Loading tripId...</div>;

  return (
    <div>
      <h1>TripID Test</h1>
      <p>Trip ID: {tripId}</p>
    </div>
  );
}
