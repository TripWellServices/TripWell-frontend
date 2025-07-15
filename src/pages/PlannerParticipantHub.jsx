// src/pages/PlannerParticipantHub.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PlannerParticipantHub() {
  const [tripBase, setTripBase] = useState(null);
  const [anchors, setAnchors] = useState([]);
  const [tripDays, setTripDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const hydrate = async () => {
      try {
        const token = await window.firebase.auth().currentUser.getIdToken();

        // TripBase info
        const baseRes = await fetch("https://gofastbackend.onrender.com/tripwell/tripstatus", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const baseData = await baseRes.json();
        if (!baseData.tripId) {
          navigate("/tripwell/tripnotcreated");
          return;
        }

        const tripRes = await fetch(
          `https://gofastbackend.onrender.com/tripwell/tripcreated/${baseData.tripId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const tripData = await tripRes.json();
        setTripBase(tripData);

        // AnchorLogic
        const anchorRes = await fetch(
          `https://gofastbackend.onrender.com/tripwell/anchors/logic/${baseData.tripId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const anchorData = await anchorRes.json();
        setAnchors(anchorData.selectedAnchors || []);

        // TripDays
        const daysRes = await fetch(
          `https://gofastbackend.onrender.com/tripwell/tripdays/${baseData.tripId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const daysData = await daysRes.json();
        setTripDays(daysData || []);
      } catch (err) {
        console.error("❌ Failed to load participant view:", err);
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, [navigate]);

  if (loading) return <div className="p-6 text-center text-gray-500">Loading your trip details…</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-blue-700">🧳 You're Going on a Trip!</h1>
      <p className="text-gray-700">
        Your trip with <strong>{tripBase?.plannerName || "your travel companion"}</strong> to{" "}
        <strong>{tripBase?.city || "your destination"}</strong> is coming up soon!
      </p>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mt-4">✨ Curated Highlights</h2>
        {anchors.length > 0 ? (
          <ul className="list-disc list-inside text-gray-700 mt-2">
            {anchors.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No highlights added yet.</p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mt-6">🗓️ Your Trip Plan</h2>
        {tripDays.length > 0 ? (
          tripDays.map((day, i) => (
            <div key={i} className="border border-gray-300 p-4 rounded-lg mb-4 space-y-2">
              <h3 className="font-semibold text-blue-600">Day {day.dayIndex}</h3>
              <p className="text-gray-700 italic">{day.summary}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-blue-500">🌅 Morning</h4>
                  <p>{day.blocks?.morning || "Nothing planned"}</p>
                </div>
                <div>
                  <h4 className="font-medium text-green-500">🌤 Afternoon</h4>
                  <p>{day.blocks?.afternoon || "Nothing planned"}</p>
                </div>
                <div>
                  <h4 className="font-medium text-purple-500">🌙 Evening</h4>
                  <p>{day.blocks?.evening || "Nothing planned"}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Itinerary not available yet. Check back soon.</p>
        )}
      </section>
    </div>
  );
}
