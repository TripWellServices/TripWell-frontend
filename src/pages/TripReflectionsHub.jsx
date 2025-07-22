// src/pages/TripReflectionsHub.jsx

import { useNavigate } from "react-router-dom";

export default function TripReflectionsHub() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto p-8 text-center space-y-6">
      <h1 className="text-3xl font-bold">📓 Your Reflections</h1>
      <p className="text-gray-700 text-lg">
        For now, TripWell supports one trip at a time. You’ll be able to view your most recent trip and the memories you captured.
      </p>

      <div className="bg-white shadow-md rounded-xl p-6 border space-y-4 text-left">
        <h2 className="text-xl font-semibold text-gray-900">✨ Past Trip</h2>
        <p className="text-gray-600">More features for multiple trips coming soon. In the meantime, relive the moments from your last adventure.</p>
      </div>

      <button
        onClick={() => navigate("/reflections/last")}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-lg"
      >
        ▶️ View Last Trip
      </button>
    </div>
  );
}
