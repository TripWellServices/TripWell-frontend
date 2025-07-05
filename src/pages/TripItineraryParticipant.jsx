import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserAndTrip } from "../services/userService";

const BACKEND_URL = "https://gofastbackend.onrender.com";

export default function TripItineraryParticipant() {
  const [tripDays, setTripDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { user, trip } = await getUserAndTrip();
        if (!trip || !trip._id) {
          alert("Trip not found.");
          navigate("/");
          return;
        }
        setTrip(trip);

        const res = await fetch(`${BACKEND_URL}/tripwell/itinerary/${trip._id}`);
        const data = await res.json();
        setTripDays(data);
      } catch (err) {
        console.error("❌ Failed to fetch trip days:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) return <div className="p-6 text-gray-600">Loading itinerary…</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-2 text-center text-blue-600">
        {trip?.tripName} — Your Trip Plan
      </h1>
      <p className="text-center text-gray-500 mb-6">
        You’re viewing this trip as a participant. Your trip organizer is managing the plan.
      </p>

      {tripDays.length === 0 ? (
        <div className="text-center text-gray-500 bg-yellow-50 border border-yellow-300 rounded-lg p-4">
          <p className="text-lg font-medium mb-2">🕒 Itinerary not ready yet</p>
          <p>The trip planner hasn’t created the schedule yet. Check back soon to see your day-by-day experience.</p>
        </div>
      ) : (
        tripDays.map((day, index) => (
          <div key={index} className="border border-gray-300 p-4 rounded-lg space-y-2">
            <h2 className="text-xl font-semibold">Day {index + 1}</h2>
            <p className="text-gray-700 italic">{day.summary}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium text-blue-500">🌅 Morning</h3>
                <p>{day.blocks?.morning || "Nothing planned"}</p>
              </div>
              <div>
                <h3 className="font-medium text-green-500">🌤 Afternoon</h3>
                <p>{day.blocks?.afternoon || "Nothing planned"}</p>
              </div>
              <div>
                <h3 className="font-medium text-purple-500">🌙 Evening</h3>
                <p>{day.blocks?.evening || "Nothing planned"}</p>
              </div>
            </div>
          </div>
        ))
      )}

      <div className="mt-10 text-center">
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-gray-200 hover:bg-gray-300 text-black px-6 py-2 rounded transition"
        >
          ⬅️ Back to Home
        </button>
      </div>
    </div>
  );
}