// src/pages/TripJournal.jsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function TripJournal() {
  const { tripId } = useParams();
  const [entry, setEntry] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function fetchJournal() {
      try {
        const res = await axios.get(`/tripwell/journal/${tripId}`);
        setEntry(res.data?.entry || "");
      } catch (err) {
        console.error("❌ Failed to load journal", err);
      }
    }

    fetchJournal();
  }, [tripId]);

  async function handleSave() {
    try {
      setSaving(true);
      await axios.post(`/tripwell/journal/${tripId}`, { entry });
      setStatus("Saved!");
      setTimeout(() => setStatus(""), 2000);
    } catch (err) {
      console.error("❌ Failed to save journal", err);
      setStatus("Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-center">📓 Trip Journal</h2>

      <textarea
        className="w-full p-4 border rounded min-h-[200px] resize-vertical"
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="Write anything you want about this trip..."
      />

      <div className="flex justify-between items-center">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl"
        >
          {saving ? "Saving..." : "Save Journal"}
        </button>
        {status && <span className="text-sm text-gray-500">{status}</span>}
      </div>
    </div>
  );
}
