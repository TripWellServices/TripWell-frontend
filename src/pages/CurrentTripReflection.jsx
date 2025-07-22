// src/pages/CurrentTripReflection.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function CurrentTripReflection() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [reflections, setReflections] = useState([]);
  const [city, setCity] = useState("");
  const [tripName, setTripName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function hydrate() {
      try {
        const tripRes = await axios.get(`/tripwell/tripbase/${tripId}`);
        setCity(tripRes.data.city || "");
        setTripName(tripRes.data.name || "Your Trip");

        const reflRes = await axios.get(`/tripwell/reflections/${tripId}`);
        setReflections(reflRes.data || []);
      } catch (err) {
        console.error("Reflection hydration error:", err);
      } finally {
        setLoading(false);
      }
    }

    hydrate();
  }, [tripId]);

  if (loading) return <div className="p-6 text-center">Loading your trip memories...</div>;
  if (!reflections.length) return <div className="p-6 text-center">No reflections found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">✨ Memories from {tripName}</h1>
      <p className="text-center text-gray-600">Here’s what made your time in {city} unforgettable.</p>

      <div className="bg-white shadow-md rounded-xl p-4 border">
        {reflections.map((ref, i) => (
          <div key={i} className="mb-6 border-t pt-4">
            <h3 className="text-lg font-bold">Day {ref.dayIndex + 1}</h3>
            <p className="text-gray-800 font-medium mb-1">Summary: {ref.summary}</p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Mood:</span> {ref.moodTag}
            </p>
            <p className="text-gray-800 whitespace-pre-wrap">{ref.journalText}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/tripwell/home")}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-lg"
      >
        🏠 Return Home
      </button>
    </div>
  );
}
