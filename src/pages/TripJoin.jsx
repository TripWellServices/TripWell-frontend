// src/pages/TripJoin.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import axios from "axios";

export default function TripJoin() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");  // Clear previous errors
    setLoading(true);  // Start loading

    const auth = getAuth();
    const user = auth.currentUser;

    // Check if user is logged in
    if (!user) {
      setError("You must be logged in to join a trip.");
      setLoading(false);  // Stop loading
      return;
    }

    try {
      const idToken = await user.getIdToken();
      const firebaseId = user.uid;

      // Step 1: Join the trip using join code
      const res = await axios.post(
        "/api/trips/join",
        { joinCode, userId: firebaseId },
        {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        }
      );

      if (res.status !== 200 || !res.data.tripId) {
        setError("Failed to join the trip.");
        setLoading(false);  // Stop loading
        return;
      }

      const tripId = res.data.tripId;

      // ✅ Step 2: Update user with tripId
      await axios.post("/api/usertrip/set", { tripId }, {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });

      // ✅ Step 3: Go to TripWellHub
      navigate(`/trip/${tripId}`);
    } catch (err) {
      console.error(err);
      setError("Trip not found or failed to join.");
    } finally {
      setLoading(false);  // Stop loading
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-4">Join a Trip</h2>

      {error && <p className="text-red-500 text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="joinCode" className="block text-sm font-medium">Join Code</label>
          <input
            id="joinCode"
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter your trip's join code"
          />
        </div>

        <button
          type="submit"
          className={`w-full py-2 rounded-lg ${loading ? "bg-gray-400" : "bg-blue-600 text-white"} ${loading ? "cursor-not-allowed" : "hover:bg-blue-700"}`}
          disabled={loading}
        >
          {loading ? "Joining..." : "Join Trip"}
        </button>
      </form>

      <p className="text-center text-sm mt-4">
        <a href="/hub" className="text-blue-600">Back to the Hub</a>
      </p>
    </div>
  );
}
