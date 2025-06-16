// src/pages/TripSetup.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/**
 * TripSetup.jsx
 * MVP 1 Trip Creation Page
 *
 * 🧠 This sets up a new trip with user-defined name, purpose, dates, and join code.
 * ✅ Uses /tripwell/whoami to hydrate user context (no Firebase context used directly)
 * 🔑 Join code is user-created and used by others to join the trip later
 * 📍 City = Destination (single-city logic only for MVP 1)
 * 👨‍👩‍👧‍👦 Also includes basic party composition logic (who's coming)
 */

const BACKEND_URL = "https://gofastbackend.onrender.com";

export default function TripSetup() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [tripData, setTripData] = useState({
    tripName: "",
    joinCode: "",
    purpose: "",
    destination: "",
    startDate: "",
    endDate: "",
    whoWith: "",
    partyCount: "",
  });

  const [error, setError] = useState("");

  // 🧠 Always hydrate user via /tripwell/whoami
  useEffect(() => {
    const hydrateUser = async () => {
      try {
        const firebaseUser = window?.firebase?.auth?.()?.currentUser;
        if (!firebaseUser) return navigate("/explainer");

        const token = await firebaseUser.getIdToken(true);
        const res = await fetch(`${BACKEND_URL}/tripwell/whoami`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { user } = await res.json();
        if (!user) return navigate("/explainer");
        setUser({ ...user, firebaseToken: token });
      } catch (err) {
        console.error("❌ Failed to hydrate user:", err);
        navigate("/explainer");
      }
    };

    hydrateUser();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTripData({ ...tripData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const payload = {
        userId: user.firebaseId || user._id, // 🔑 Uses firebaseId for user linkage
        ...tripData,
        city: tripData.destination, // 🔁 city = destination (MVP 1 assumption)
      };

      const res = await axios.post(`${BACKEND_URL}/trip`, payload, {
        headers: { Authorization: `Bearer ${user.firebaseToken}` },
      });

      navigate("/tripplanner");
    } catch (err) {
      console.error("❌ Trip creation failed:", err);
      setError(err.response?.data?.error || "Trip creation failed.");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Start Your Trip</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Trip Name */}
        <div>
          <label className="block mb-1 font-medium">Trip Name</label>
          <input
            type="text"
            name="tripName"
            value={tripData.tripName}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="e.g., Paris 2025"
            required
          />
        </div>

        {/* Join Code */}
        <div>
          <label className="block mb-1 font-medium">Join Code</label>
          <input
            type="text"
            name="joinCode"
            value={tripData.joinCode}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="e.g., paris2025"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Make it short and easy to remember — this is how others join your trip!
          </p>
        </div>

        {/* Purpose */}
        <div>
          <label className="block mb-1 font-medium">Purpose</label>
          <input
            type="text"
            name="purpose"
            value={tripData.purpose}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="e.g., Vacation, Business"
            required
          />
        </div>

        {/* Destination (single-city only) */}
        <div>
          <label className="block mb-1 font-medium">Destination City</label>
          <input
            type="text"
            name="destination"
            value={tripData.destination}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="e.g., Paris"
            required
          />
        </div>

        {/* Dates */}
        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block mb-1 font-medium">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={tripData.startDate}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 font-medium">End Date</label>
            <input
              type="date"
              name="endDate"
              value={tripData.endDate}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
        </div>

        {/* Who's Coming */}
        <div>
          <label className="block mb-1 font-medium">Who’s Coming With You?</label>
          <input
            type="text"
            name="whoWith"
            value={tripData.whoWith}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="e.g., Spouse and 2 kids"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">How Many People Total?</label>
          <input
            type="number"
            name="partyCount"
            value={tripData.partyCount}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="e.g., 4"
          />
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          🚀 Let’s Plan
        </button>
      </form>
    </div>
  );
}
