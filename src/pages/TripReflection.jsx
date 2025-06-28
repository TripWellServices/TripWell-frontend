// src/pages/TripReflection.jsx

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function TripReflection() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [rating, setRating] = useState("");
  const [memory, setMemory] = useState("");
  const [delta, setDelta] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    try {
      setSaving(true);
      await axios.post(`/tripwell/reflection/${tripId}`, {
        rating,
        memory,
        delta,
      });
      navigate("/"); // or return to home/dashboard
    } catch (err) {
      console.error("❌ Failed to save reflection", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-center">📝 Trip Reflection</h2>

      <div>
        <label className="block font-medium mb-1">Overall, how was it?</label>
        <select
          className="w-full p-2 border rounded"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        >
          <option value="">Select an emoji</option>
          <option value="😄">😄 Amazing</option>
          <option value="🙂">🙂 Pretty Good</option>
          <option value="😐">😐 Okay</option>
          <option value="😞">😞 Not Great</option>
        </select>
      </div>

      <div>
        <label className="block font-medium mb-1">Favorite memory</label>
        <textarea
          className="w-full p-3 border rounded resize-none"
          rows={3}
          value={memory}
          onChange={(e) => setMemory(e.target.value)}
          placeholder="The best part of the trip was..."
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Anything you’d do differently?</label>
        <textarea
          className="w-full p-3 border rounded resize-none"
          rows={3}
          value={delta}
          onChange={(e) => setDelta(e.target.value)}
          placeholder="Next time, I’d probably..."
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700"
      >
        {saving ? "Saving..." : "Save Reflection"}
      </button>
    </div>
  );
}
