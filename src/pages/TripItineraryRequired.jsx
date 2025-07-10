import { useNavigate } from "react-router-dom";

export default function TripItineraryRequired() {
  const navigate = useNavigate();

  return (
    <div className="max-w-xl mx-auto p-6 text-center">
      <p className="mb-6 text-gray-700 text-lg">
        You haven’t created a trip yet, so you can’t start planning.
        <br />
        Set your dates, where you're headed, and who’s coming with you — 
        so we can make the best experience possible.
      </p>

      <div className="flex gap-4 justify-center">
        <button
          onClick={() => navigate("/tripwell/tripsetup")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          🌍 Create My Trip
        </button>
        <button
          onClick={() => navigate("/tripwell/home")}
          className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400"
        >
          ⬅️ Take Me Back Home
        </button>
      </div>
    </div>
  );
}
