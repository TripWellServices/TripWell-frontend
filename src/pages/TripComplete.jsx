// src/pages/TripComplete.jsx

import { useNavigate, useParams } from "react-router-dom";

export default function TripComplete() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 text-center bg-white">
      <h1 className="text-3xl font-bold text-green-600 mb-4">🎉 Trip Complete!</h1>
      <p className="text-gray-700 max-w-md mb-6">
        You made it! That’s the whole trip. Thanks for using TripWell to help shape your journey.
      </p>
      <button
        onClick={() => navigate(`/tripwell/reflect/${tripId}`)}
        className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow hover:bg-blue-700"
      >
        ✍️ Add a Reflection
      </button>
    </div>
  );
}
