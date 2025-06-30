import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 bg-white gap-4 text-center">
      <h1 className="text-3xl font-bold text-green-600 mt-2">TripWell</h1>

      <p className="text-gray-600 max-w-md mt-2">
        Plan the kind of trip that makes memories — not stress. TripWell helps you shape each day around what matters most to you.
      </p>

      <div className="flex flex-col gap-3 mt-8 w-full max-w-xs">

        {/* Navigates directly to trip planner — auth check happens *there* */}
        <button
          onClick={() => navigate("/trip-planner")}
          className="bg-green-500 hover:bg-green-600 text-white py-2 rounded shadow"
        >
          ✍️ Create a New Trip
        </button>

        {/* MVP2 shared trip logic */}
        <button
          onClick={() => navigate("/join-trip")}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded shadow"
        >
          🧳 Join a Trip
        </button>

        {/* Plan trip using whoami behind the scenes */}
        <button
          onClick={() => navigate("/smartplanner")}
          className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded shadow"
        >
          🗺️ Plan My Trip
        </button>

        {/* Modify flow */}
        <button
          onClick={() => navigate("/trip-modifier")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded shadow"
        >
          🛠️ Edit My Trip
        </button>

        {/* Live experience */}
        <button
          onClick={() => navigate("/tripliveday")}
          className="bg-pink-500 hover:bg-pink-600 text-white py-2 rounded shadow"
        >
          🌞 Live My Trip
        </button>

        {/* Reflection + journaling */}
        <button
          onClick={() => navigate("/trip-journal")}
          className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded shadow"
        >
          📓 Trip Journal
        </button>

        {/* Info page */}
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
