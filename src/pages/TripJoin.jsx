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
      setError("Trip not found. Please double-check the join code with your trip organizer.");
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

      navigate("/profileparticipant");

    } catch (err) {
      console.error("❌ Error joining trip:", err);
      alert("Could not join trip. Please make sure you're signed in and try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-4">Join a Trip</h2>

      {error && <p className="text-red-500 text-center mb-2">{error}</p>}

      {!tripData && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="joinCode" className="block text-sm font-medium text-gray-700">
              Trip Join Code
            </label>
            <p className="text-xs text-gray-600 mb-2">
              Ask your trip organizer for the join code. It's like a "room code" that lets you join their trip planning.
            </p>
            <input
              id="joinCode"
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., PARIS2025, BEACHWEEK"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !joinCode.trim()}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              loading || !joinCode.trim() 
                ? "bg-gray-400 text-gray-600 cursor-not-allowed" 
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loading ? "🔍 Checking Join Code..." : "Join Trip"}
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
