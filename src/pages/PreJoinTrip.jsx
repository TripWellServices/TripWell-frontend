import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import BACKEND_URL from "../config";

export default function PreJoinTrip() {
  const navigate = useNavigate();

  const handleJoinClick = async () => {
    try {
      const user = auth.currentUser;

      // Not signed in yet? → route to access explanation
      if (!user) {
        navigate("/joinaccess");
        return;
      }

      // Signed in → check user + trip
      const token = await user.getIdToken(true);
      const res = await fetch(`${BACKEND_URL}/tripwell/whoami`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { user: whoUser, trip } = await res.json();

      if (whoUser && trip) {
        navigate("/alreadyjoined"); // Or future /choosejoin
      } else if (whoUser && !trip) {
        navigate("/join");
      } else {
        alert("Couldn’t verify your account. Try again.");
      }
    } catch (err) {
      console.error("Join error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 space-y-6 text-center">
      <h1 className="text-3xl font-bold text-blue-700">Join a Trip</h1>
      <p className="text-lg text-gray-700">
        You’ve been invited to a TripWell experience. To continue, you’ll need to sign in
        so we can connect you to your trip.
      </p>
      <div className="space-y-4">
        <button
          onClick={handleJoinClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-lg"
        >
          ✅ Yes, I want to join a trip
        </button>
        <button
          onClick={() => navigate("/home")}
          className="text-blue-700 underline text-sm"
        >
          ❌ Take me back home
        </button>
      </div>
    </div>
  );
}
