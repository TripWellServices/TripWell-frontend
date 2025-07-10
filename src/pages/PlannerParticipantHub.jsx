import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function PlannerParticipantHub() {
  const { tripId } = useParams();
  const [tripIntent, setTripIntent] = useState(null);
  const [anchors, setAnchors] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const token = await window.firebase.auth().currentUser.getIdToken();

        // Get trip intent
        const intentRes = await fetch(
          `https://gofastbackend.onrender.com/tripwell/tripintent/${tripId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const intentData = await intentRes.json();
        setTripIntent(intentData);

        // Get selected anchors
        const anchorRes = await fetch(
          `https://gofastbackend.onrender.com/tripwell/anchors/logic/${tripId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const anchorData = await anchorRes.json();
        setAnchors(anchorData.selectedAnchors || []);

        // Get trip days
        const dayRes = await fetch(
          `https://gofastbackend.onrender.com/tripwell/tripdays/${tripId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const dayData = await dayRes.json();
        setItinerary(dayData || []);
      } catch (err) {
        console.error("❌ Failed to hydrate participant hub", err);
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, [tripId]);

  if (loading) return <div className="p-6 text-gray-600">Loading your trip info...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-blue-700">📋 Your Trip Overview</h1>
      <p className="text-gray-700">
        You're part of this TripWell journey. As your planner continues to build the trip,
        you'll be able to see the intent, core experiences, and the day-by-day flow.
      </p>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-gray-800">🧠 Trip Intent</h2>
        {tripIntent ? (
          <pre className="bg-gray-100 p-3 rounded text-sm">{JSON.stringify(tripIntent, null, 2)}</pre>
        ) : (
          <p className="text-gray-500">Trip intent not yet set by the planner.</p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800">📌 Anchor Experiences</h2>
        {anchors.length > 0 ? (
          <ul className="list-disc list-inside text-gray-700">
            {anchors.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No anchor selections yet.</p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800">🗓️ Itinerary</h2>
        {itinerary.length > 0 ? (
          itinerary.map((day, i) => (
            <div key={i} className="border p-3 rounded mb-4">
              <h3 className="font-semibold text-blue-600">Day {day.dayIndex}: {day.title}</h3>
              <p className="text-gray-700 mb-2">{day.summary}</p>
              <ul className="list-disc list-inside text-gray-600">
                {day.activities.map((act, j) => (
                  <li key={j}>{act}</li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Itinerary not yet built.</p>
        )}
      </section>
    </div>
  );
}