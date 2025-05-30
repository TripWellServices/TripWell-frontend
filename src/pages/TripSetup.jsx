import React, { useEffect, useState } from "react";
import axios from "axios";

export default function TripList({ userId }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await axios.get(
          `https://gofastbackend.onrender.com/api/trips/by-user/${userId}`
        );
        setTrips(res.data);
      } catch (err) {
        console.error("Failed to fetch trips:", err);
        setError("Could not load trips.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchTrips();
  }, [userId]);

  if (loading) return <p>Loading trips...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (trips.length === 0) return <p>No trips found.</p>;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">My Trips</h2>
      {trips.map((trip) => (
        <div
          key={trip.tripId}
          className="border p-4 rounded shadow bg-white"
        >
          <h3 className="text-lg font-semibold">{trip.tripName}</h3>
          <p className="text-sm text-gray-600">{trip.purpose}</p>
          <p className="text-sm">
            {trip.startDate} → {trip.endDate}
          </p>
          <p className="text-sm italic">Destination: {trip.destinations?.[0]?.city}</p>
        </div>
      ))}
    </div>
  );
}
