import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import axios from "axios";

export default function TripSetup() {
  const [tripName, setTripName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [destination, setDestination] = useState("");
  const [purpose, setPurpose] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Validate join code format: 4-10 alphanumeric chars
  const isJoinCodeValid = (code) => /^[a-zA-Z0-9]{4,10}$/.test(code);

  const handleCreateTrip = async () => {
    setError("");

    if (!isJoinCodeValid(joinCode)) {
      setError("Join code must be 4-10 alphanumeric characters.");
      return;
    }

    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      const firebaseId = auth.currentUser.uid;

      const payload = {
        joinCode,
        tripName,
        purpose,
        startDate,
        endDate,
        userId: firebaseId,
        destinations: [{ city: destination }],
      };

      const res = await axios.post(
        "https://gofastbackend.onrender.com/api/trips/create",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const tripId = res.data.tripId;
      console.log("✅ Trip created:", tripId);
      navigate(`/trip/${tripId}`);
    } catch (err) {
      console.error("❌ Failed to create trip:", err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Plan a New Trip</h2>

      <input
        className="w-full border p-2 mb-3 rounded"
        placeholder="Trip Name"
        value={tripName}
        onChange={(e) => setTripName(e.target.value)}
      />

      {/* Explainer Text */}
      <p className="mb-4 text-gray-700">
        This is your opportunity to create a memorable join code — a simple, unique key your friends will use to join your trip. Make it easy to remember and share it with your crew after creation!
      </p>

      <input
        className="w-full border p-2 mb-3 rounded"
        placeholder="Join Code (4-10 alphanumeric chars)"
        value={joinCode}
        onChange={(e) => setJoinCode(e.target.value)}
      />

      <input
        className="w-full border p-2 mb-3 rounded"
        placeholder="Destination City"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />

      <div className="flex space-x-2 mb-3">
        <input
          className="w-1/2 border p-2 rounded"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          className="w-1/2 border p-2 rounded"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <textarea
        className="w-full border p-2 mb-4 rounded"
        placeholder="What's the purpose or vibe of this trip?"
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
      />

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <button
        onClick={handleCreateTrip}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        Create Trip
      </button>
    </div>
  );
}
