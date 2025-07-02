// src/pages/TripComplete.jsx
import { useParams, useNavigate } from "react-router-dom";

export default function TripComplete() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-2xl mx-auto text-center space-y-6">
      <h1 className="text-4xl font-bold text-green-700">🎉 You Did It!</h1>
      <p className="text-lg text-gray-700">
        Your trip is complete. The memories you made are locked in.
      </p>

      <div className="space-y-4">
        <button
          onClick={() => navigate(`/tripwell/reflections/${tripId}`)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-lg"
        >
          📓 See My Reflections
        </button>

        <button
          onClick={() => navigate("/tripwell")}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl text-lg"
        >
          ✈️ Plan Another Trip
        </button>
      </div>
    </div>
  );
}
