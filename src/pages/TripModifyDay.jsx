import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TripModifyDay() {
  const [dayData, setDayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDay() {
      const dayIndex = localStorage.getItem("modifyDayIndex");

      try {
        const statusRes = await axios.get("/tripwell/tripstatus");
        const { tripId } = statusRes.data;

        if (!tripId || !dayIndex) {
          navigate("/tripwell/tripitineraryrequired");
          return;
        }

        const res = await axios.get(`/tripwell/modifyday/${tripId}/${dayIndex}`);
        setDayData(res.data);
      } catch (err) {
        console.error("Error loading day:", err);
        setError("Could not load trip day.");
      } finally {
        setLoading(false);
      }
    }

    fetchDay();
  }, [navigate]);

  async function handleSubmit() {
    if (!feedback.trim()) return;
    setSaving(true);

    try {
      const statusRes = await axios.get("/tripwell/tripstatus");
      const { tripId } = statusRes.data;
      const dayIndex = localStorage.getItem("modifyDayIndex");

      const res = await axios.post("/tripwell/modifygpt/day", {
        tripId,
        dayIndex,
        feedback,
      });

      setDayData(res.data); // Update with new modified version
      setFeedback("");
    } catch (err) {
      console.error("Failed to update day:", err);
      setError("Update failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-4">Loading trip day...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!dayData) return null;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Modify Day {dayData.dayIndex}</h2>
      <p className="mb-2 italic text-sm text-gray-600">{dayData.summary}</p>

      {["morning", "afternoon", "evening"].map((part) => {
        const block = dayData.blocks?.[part];
        return (
          block && (
            <div key={part} className="mb-4">
              <h3 className="font-semibold capitalize">{part}</h3>
              <p className="text-sm">{block.title}</p>
              <p className="text-xs text-gray-600">{block.desc}</p>
            </div>
          )
        );
      })}

      <textarea
        className="w-full border rounded-md p-2 text-sm"
        rows={4}
        placeholder="Enter your feedback to improve this day..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md"
      >
        {saving ? "Saving..." : "Update with AI"}
      </button>

      <div className="mt-6">
        <button
          onClick={() => navigate("/tripwell/modifydays")}
          className="text-sm text-green-700 underline"
        >
          ← Back to Overview
        </button>
      </div>
    </div>
  );
}
