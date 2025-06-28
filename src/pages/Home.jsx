import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

export default function Home() {
  const navigate = useNavigate();

  const handlePlanTrip = async () => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return navigate("/explainer");

      const token = await firebaseUser.getIdToken(true);
      const res = await fetch("https://gofastbackend.onrender.com/tripwell/whoami", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { user, trip } = await res.json();
      if (!user || !user._id) return navigate("/explainer");
      if (!trip || !trip._id) return navigate("/generalhub");

      return navigate("/trip-planner");
    } catch (err) {
      console.error("💥 Plan Trip failed:", err);
      navigate("/explainer");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 bg-white gap-4 text-center">
      <h1 className="text-3xl font-bold text-green-600 mt-2">TripWell</h1>

      <p className="text-gray-600 max-w-md mt-2">
        Plan the kind of trip that makes memories — not stress. TripWell helps you shape each day around what matters most to you.
      </p>

      <div className="flex flex-col gap-3 mt-8 w-full max-w-xs">
        <button
          onClick={() => navigate("/trip-setup")}
          className="bg-green-500 hover:bg-green-600 text-white py-2 rounded shadow"
        >
          ✍️ Create a New Trip
        </button>
        <button
          onClick={() => navigate("/join-trip")}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded shadow"
        >
          🧳 Join a Trip
        </button>
        <button
          onClick={handlePlanTrip}
          className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded shadow"
        >
          🗺️ Plan My Trip
        </button>
        <button
          onClick={() => navigate("/trip-modifyer")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded shadow"
        >
          🛠️ Edit My Trip
        </button>
        <button
          onClick={() => navigate("/tripliveday")}
          className="bg-pink-500 hover:bg-pink-600 text-white py-2 rounded shadow"
        >
          🌞 Live My Trip
        </button>
        <button
          onClick={() => navigate("/trip-journal")}
          className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded shadow"
        >
          📓 Trip Journal
        </button>
        <button
          onClick={() => navigate("/explainer")}
          className="bg-gray-100 hover:bg-gray-200 py-2 rounded shadow"
        >
          🧠 What is TripWell?
        </button>
      </div>
    </div>
  );
}