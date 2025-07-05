import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

export default function TripSetup() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tripName, setTripName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    const hydrate = async () => {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        navigate("/access"); // 👈 redirect if not logged in
        return;
      }

      try {
        const token = await firebaseUser.getIdToken(true);
        const res = await fetch("https://gofastbackend.onrender.com/tripwell/whoami", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { user } = await res.json();
        if (!user || !user._id) {
          navigate("/signup"); // 👈 not a TripWell user yet
          return;
        }

        setUser(user);
      } catch (err) {
        console.error("Failed to hydrate user:", err);
        navigate("/access");
      }
    };

    hydrate();
  }, [navigate]);

  const handleSubmit = async () => {
    try {
      const token = await auth.currentUser.getIdToken(true);
      const res = await fetch("https://gofastbackend.onrender.com/tripwell/tripbase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user._id,
          tripName,
          purpose,
          startDate,
          endDate,
          joinCode,
        }),
      });

      const { trip } = await res.json();
      if (!trip || !trip._id) throw new Error("Trip creation failed");

      // 🔁 Redirect to next step (trip intent)
      navigate(`/tripwell/${trip._id}/intent`);
    } catch (err) {
      console.error("❌ Trip setup failed", err);
      alert("Could not save your trip. Try again.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Set Up Your Trip</h1>

      <input
        value={tripName}
        onChange={(e) => setTripName(e.target.value)}
        placeholder="Trip Name"
        className="w-full p-3 border rounded"
      />
      <input
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
        placeholder="Purpose (e.g., Vacation, Reunion)"
        className="w-full p-3 border rounded"
      />
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="w-full p-3 border rounded"
      />
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="w-full p-3 border rounded"
      />
      <input
        value={joinCode}
        onChange={(e) => setJoinCode(e.target.value)}
        placeholder="Join Code (optional)"
        className="w-full p-3 border rounded"
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition"
      >
        Create Trip
      </button>
    </div>
  );
}