import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const navigate = useNavigate();
  const userId = "user-123"; // TODO: replace with real auth logic

  useEffect(() => {
    if (!userId) return;
    axios.get(`/api/trips/by-user/${userId}`)
      .then((res) => setTrips(res.data))
      .catch((err) => console.error("Failed to load trips:", err));
  }, [userId]);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">My Trips</h1>
      {trips.length === 0 ? (
        <p className="text-gray-600">You don’t have any trips yet.</p>
      ) : (
        <div className="grid gap-4">
          {trips.map((trip) => (
            <div
              key={trip.tripId}
              onClick={() => navigate(`/trip/${trip.tripId}`)}
              className="cursor-pointer border p-4 rounded-lg shadow bg-white hover:bg-gray-50 transition"
            >
              <h2 className="text-xl font-semibold">{trip.tripName || 'Untitled Trip'}</h2>
              <p className="text-sm text-gray-600">
                {trip.destinations?.map((d) => d.city).join(', ') || "No destinations yet"}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(trip.startDate).toLocaleDateString()} — {new Date(trip.endDate).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
