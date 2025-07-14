import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TripItineraryBuilder() {
  const navigate = useNavigate();
  const [itineraryText, setItineraryText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function buildItinerary() {
      try {
        // Step 1: Get tripId from whoami
        const whoRes = await axios.get("/tripwell/whoami");
        const tripId = whoRes.data?.trip?._id;

        if (!tripId) {
          setError("No trip found. Returning home.");
          setTimeout(() => navigate("/tripwell/home"), 2500);
          return;
        }

        // Step 2: Build itinerary via Angela (GPT)
        const res = await axios.post("/tripwell/itinerary/build", { tripId });
        const { daysSaved } = res.data;

        // Step 3: Optional — summarize it for display
        const savedDays = await axios.get(`/tripwell/itinerary/days/${tripId}`);
        const combinedSummary = savedDays.data
          .map((day) => `Day ${day.dayIndex}: ${day.summary}`)
          .join("\n");

        setItineraryText(combinedSummary || "Angela generated your itinerary.");
      } catch (err) {
        console.error("Itinerary generation error:", err);
        setError("Something went wrong while building your itinerary.");
      } finally {
        setLoading(false);
      }
    }

    buildItinerary();
  }, [navigate]);

  async function handleSave() {
    try {
      setSaving(true);
      navigate("/tripwell/home");
    } catch (err) {
      console.error("Save error:", err);
      setError("Could not save itinerary.");
    } finally {
      setSaving(false);
    }
  }

  function handleModify() {
    navigate("/tripwell/itinerary/modify");
  }

  if (loading) return <div className="p-4 text-center">Building your itinerary with Angela...</div>;
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
