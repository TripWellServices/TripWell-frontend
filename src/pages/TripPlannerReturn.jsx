import { useNavigate } from "react-router-dom";

export default function TripPlannerReturn() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Build or Update Your Itinerary</h1>

      <p className="mb-4 text-sm text-gray-700">
        What would you like to do next?
      </p>

      <div className="flex flex-col gap-4">
        <button
          className="bg-blue-600 text-white px-4 py-3 rounded-md"
          onClick={() => navigate("/prepbuild")}
        >
          Build My Itinerary
        </button>

        <button
          className="bg-green-600 text-white px-4 py-3 rounded-md"
          onClick={() => navigate("/itineraryupdate")}
        >
          Update / View My Itinerary
        </button>
      </div>
    </div>
  );
}
