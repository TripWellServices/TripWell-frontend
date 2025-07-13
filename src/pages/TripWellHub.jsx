import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TripWellHub() {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTrip() {
      try {
        const { data: whoami } = await axios.get("/tripwell/whoami");
        const tripId = whoami.user?.tripId;
        const role = whoami.user?.role;

        if (!tripId) {
          navigate("/tripwell/tripitineraryrequired");
          return;
        }

        if (role === "originator") {
          const res = await axios.get(`/tripwell/tripbase/${tripId}`);
          setTrip(res.data);
        } else {
          navigate(`/tripwell/plannerparticipanthub`);
        }
      } catch (err) {
        console.error("❌ Failed to load trip base:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTrip();
  }, [navigate]);

  if (loading) return <div className="p-6 text-center">Loading your trip dashboard…</div>;
  if (!trip) return <div className="p-6 text-red-600">Trip not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-center text-blue-700">
        Hope your trip to {trip.city} is going well!
      </h1>
      <p className="text-center text-gray-600">
        Use the cards below to make the most of your day.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Itinerary Card */}
        <div
          onClick={() => navigate(`/tripwell/live/${trip._id}`)}
          className="bg-white border rounded-xl shadow p-4 cursor-pointer hover:bg-blue-50 transition"
        >
          <h2 className="text-xl font-semibold mb-2">📅 Today’s Itinerary</h2>
          <p className="text-gray-600">See your day plan, from morning to night.</p>
        </div>

        {/* Weather Card */}
        <div className="bg-white border rounded-xl shadow p-4">
          <h2 className="text-xl font-semibold mb-2">🌤 Weather</h2>
          <p className="text-gray-600">[Weather data placeholder]</p>
        </div>

        {/* Advisories */}
        <div className="bg-white border rounded-xl shadow p-4">
          <h2 className="text-xl font-semibold mb-2">⚠️ Travel Advisories</h2>
          <p className="text-gray-600">[No active advisories for your trip.]</p>
        </div>

        {/* Tips */}
        <div className="bg-white border rounded-xl shadow p-4">
          <h2 className="text-xl font-semibold mb-2">💡 Tips for {trip.city}</h2>
          <p className="text-gray-600">[Local tips, food recs, or etiquette insights go here.]</p>
        </div>
      </div>
    </div>
  );
}
