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
  const [checkingCode, setCheckingCode] = useState(false);

  const navigate = useNavigate();

  const isJoinCodeValid = (code) => /^[a-zA-Z0-9]{4,12}$/.test(code);

  const checkJoinCode = async () => {
    if (!isJoinCodeValid(joinCode)) return;
    try {
      setCheckingCode(true);
      const res = await axios.get(`/api/trips/check-code?joinCode=${joinCode}`);
      if (!res.data.available) {
        setError("Join code already in use. Try another.");
      } else {
        setError(""); // clear if good
      }
    } catch (err) {
      setError("Error checking join code.");
    } finally {
      setCheckingCode(false);
    }
  };

  const handleCreateTrip = async () => {
    setError("");

    if (!tripName || !startDate || !endDate || !destination || !purpose) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!isJoinCodeValid(joinCode)) {
      setError("Join code must be 4–12 alphanumeric characters.");
      return;
    }

    try {
      const res = await axios.get(`/api/trips/check-code?joinCode=${joinCode}`);
      if (!res.data.available) {
        setError("Join code already in use. Please choose another.");
        return;
      }

      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();

      const payload = {
        tripName,
        purpose,
        startDate,
        endDate,
        destination,
        joinCode,
      };

      const tripRes = await axios.post("/api/trips/create", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const createdTrip = tripRes.data;
      localStorage.setItem("activeTripId", createdTrip.tripId);
      navigate(`/trip-created/${createdTrip.tripId}`);
    } catch (err) {
      console.error("❌ Trip creation failed:", err);
      setError(err.response?.data?.error || "Trip creation failed.");
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
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />

      <input
        className="input mt-2"
        type="date"
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

      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-semibold mb-1">Invite Others</h3>
        <label className="block font-medium mb-1">Join Code</label>
        <input
          className="input"
          placeholder="Create a 4–12 char code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          onBlur={checkJoinCode}
        />
        {checkingCode && <p className="text-sm text-gray-500">Checking code...</p>}
        <p className="text-sm text-gray-500 mt-1">
          This is how others will join your trip. Make it short and simple.
        </p>
      </div>

      {error && <p className="text-red-500 mt-3">{error}</p>}

      <button className="btn-primary mt-6 w-full" onClick={handleCreateTrip}>
        Create Trip
      </button>
    </div>
  );
}
