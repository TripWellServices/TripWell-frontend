import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import axios from "axios";

export default function TripSetup() {
  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [destination, setDestination] = useState("");
  const [purpose, setPurpose] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

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

      const payload = {
        tripName,
        purpose,
        startDate,
        endDate,
        destination,
        joinCode
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

      const createdTrip = res.data;
      localStorage.setItem("activeTripId", createdTrip.tripId);
      navigate(`/trip/${createdTrip.tripId}`);
    } catch (err) {
      console.error("❌ Trip creation failed:", err);
      setError("Failed to create trip. Please try again.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Plan Your Trip</h2>

      <input
        className="input"
        placeholder="Trip Name"
        value={tripName}
        onChange={(e) => setTripName(e.target.value)}
      />

      <input
        className="input mt-2"
        type="date"
        placeholder="Start Date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />

      <input
        className="input mt-2"
        type="date"
        placeholder="End Date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />

      <input
        className="input mt-2"
        placeholder="Destination (City)"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />

      <input
        className="input mt-2"
        placeholder="Purpose (e.g., family, solo, work)"
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
      />

      <div className="mt-4 border-t pt-4">
        <label className="block font-medium mb-1">Join Code</label>
        <input
          className="input"
          placeholder="Create a 4–10 char code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">
          This is how others will join your trip. Make it short and simple.
        </p>
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <button className="btn-primary mt-6 w-full" onClick={handleCreateTrip}>
        Create Trip
      </button>
    </div>
  );
}
