import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TripJoin() {
  const [joinCode, setJoinCode] = useState("");
  const [tripData, setTripData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/tripwell/validatejoincode", {
        code: joinCode.trim(),
      });

      const { tripId, tripName } = res.data;
      setTripData({ tripId, tripName, joinCode: joinCode.trim() });
    } catch (err) {
      console.error("❌ Join code validation error:", err);
      setError("Trip not found. Please check with your travel companions.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmJoin = async () => {
    try {
      const user = window?.firebase?.auth()?.currentUser;
      if (!user) throw new Error("User not signed in.");

      const idToken = await user.getIdToken();

      await axios.post(
        "/tripwell/participantuser/create",
        { joinCode: tripData.joinCode },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      navigate("/tripwell/profileparticipant");

    } catch (err) {
      console.error("❌ Error joining trip:", err);
      alert("Could not join trip. Try signing in again.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-4">Join a Trip</h2>

      {error && <p className="text-red-500 text-center mb-2">{error}</p>}

      {!tripData && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="joinCode" className="block text-sm font-medium">
              Join Code
            </label>
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
            disabled={loading}
            className={`w-full py-2 rounded-lg ${
              loading ? "bg-gray-400" : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loading ? "Checking..." : "Join Trip"}
          </button>
        </form>
      )}

      {tripData && (
        <div className="mt-6 space-y-4 text-center">
          <p className="text-lg font-medium">
            You’re about to join: <span className="font-bold">{tripData.tripName}</span>
          </p>
          <button
            onClick={handleConfirmJoin}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            ✅ Confirm and Join Trip
          </button>
        </div>
      )}
    </div>
  );
}
