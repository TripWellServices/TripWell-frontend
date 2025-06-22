import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function TripItineraryMVP() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [itineraryText, setItineraryText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchItinerary() {
      try {
        const res = await axios.get(`/tripwell/itinerarygpt/${tripId}`);
        setItineraryText(res.data); // string from Angela
      } catch (err) {
        console.error("Failed to load itinerary:", err);
        setError("Could not load itinerary.");
      } finally {
        setLoading(false);
      }
    }

    fetchItinerary();
  }, [tripId]);

  async function handleSave() {
    try {
      setSaving(true);
      await axios.post(`/tripwell/itinerary/${tripId}`, { itinerary: itineraryText });
      navigate(`/tripwell/itinerary/final/${tripId}`);
    } catch (err) {
      console.error("Save error:", err);
      setError("Could not save itinerary.");
    } finally {
      setSaving(false);
    }
  }

  function handleModify() {
    navigate(`/tripwell/daymodifier/${tripId}`);
  }

  if (loading) return <div className="p-4 text-center">Loading itinerary...</div>;
  if (error) return <div className="p-4 text-red-500 text-center">{error}</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Your Trip Itinerary</h1>

      <pre className="whitespace-pre-wrap text-gray-800 bg-white rounded-xl shadow p-4">
        {itineraryText}
      </pre>

      <div className="flex gap-4 justify-center mt-6">
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-6 py-2 rounded-2xl shadow hover:bg-green-700"
          disabled={saving}
        >
          {saving ? "Saving..." : "✅ This looks great – Save it"}
        </button>

        <button
          onClick={handleModify}
          className="bg-yellow-500 text-white px-6 py-2 rounded-2xl shadow hover:bg-yellow-600"
        >
          🛠 I want to modify
        </button>
      </div>
    </div>
  );
}
