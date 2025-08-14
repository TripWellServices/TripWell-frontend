import { useParams, useNavigate } from "react-router-dom";

export default function TripComplete() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  // Save to localStorage for test flow
  localStorage.setItem("tripStatus", "done");
  console.log("💾 Saved tripStatus to localStorage: done");

  return (
    <div className="p-8 max-w-2xl mx-auto text-center space-y-6">
      <h1 className="text-4xl font-bold text-green-700">🎉 Trip Complete</h1>
      <p className="text-lg text-gray-700">
        You made it. The trip may be over, but the memories are now a part of you.
      </p>
      <p className="text-md text-gray-600">
        Your reflections are safely stored. Revisit them anytime — or start dreaming up your next adventure.
      </p>

      <div className="space-y-4 mt-8">
        <button
          onClick={() => navigate(`/tripwell/reflections/${tripId}`)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-lg"
        >
          📓 See My Trip Memories
        </button>

        <button
          onClick={() => navigate("/tripwell/tripsetup")}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl text-lg"
        >
          ✈️ Plan Another Trip
        </button>
      </div>
    </div>
  );
}
