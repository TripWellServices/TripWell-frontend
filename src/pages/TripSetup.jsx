import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserAndTrip } from "../services/userService";


const BACKEND_URL = "https://gofastbackend.onrender.com";

export default function TripSetup() {
  const { user, trip, loading } = useTripContext();
  const [tripName, setTripName] = useState("");
  const [city, setCity] = useState("");
  const [purpose, setPurpose] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleCreateTrip = async () => {
    const newErrors = {};
    if (!tripName) newErrors.tripName = "Trip name required";
    if (!city) newErrors.city = "City required";
    if (!startDate || !endDate) newErrors.dates = "Trip dates required";
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    try {
      const token = await user?.firebaseToken; // optional: if you're storing it
      const res = await fetch(`${BACKEND_URL}/trip`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user._id,
          tripName,
          city,
          purpose,
          startDate,
          endDate,
        }),
      });

      if (!res.ok) throw new Error("Trip creation failed");

      const newTrip = await res.json();
      navigate("/tripwellhub");
    } catch (err) {
      console.error("❌ Trip creation error:", err);
      setErrors({ general: "Failed to create trip. Please try again." });
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-600">Preparing your trip setup screen…</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Start a New Trip</h1>

      <input
        value={tripName}
        onChange={(e) => setTripName(e.target.value)}
        placeholder="Trip Name"
        className="w-full p-3 border rounded"
      />
      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="City"
        className="w-full p-3 border rounded"
      />
      <input
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
        placeholder="Purpose"
        className="w-full p-3 border rounded"
      />
      <input
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        type="date"
        className="w-full p-3 border rounded"
      />
      <input
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        type="date"
        className="w-full p-3 border rounded"
      />

      {errors.general && <p className="text-red-600">{errors.general}</p>}

      <button
        onClick={handleCreateTrip}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        🚀 Create Trip
      </button>
    </div>
  );
}