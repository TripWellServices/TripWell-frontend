import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const DayChanger = () => {
  const { tripId, dayIndex } = useParams();
  const navigate = useNavigate();

  const [dayData, setDayData] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDay = async () => {
      try {
        const res = await axios.get(`/tripwell/itinerary/day/${tripId}/${dayIndex}`);
        setDayData(res.data);
      } catch (err) {
        console.error("Failed to fetch trip day", err);
      }
    };

    fetchDay();
  }, [tripId, dayIndex]);

  const handleRegenerate = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`/tripwell/gpt/regen/day/${tripId}/${dayIndex}`, {
        feedback: feedback.trim()
      });

      if (res.data?.success) {
        navigate(`/tripwell/itinerary/${tripId}`);
      }
    } catch (err) {
      console.error("Failed to regenerate day", err);
    } finally {
      setLoading(false);
    }
  };

  if (!dayData) return <div className="p-6">Loading day...</div>;

  const { summary, blocks } = dayData;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">🔧 Modify Day {dayIndex}</h2>

      <div className="bg-gray-100 p-4 rounded">
        <div className="mb-2 font-semibold">Summary:</div>
        <div className="mb-4 text-gray-700">{summary}</div>

        {["morning", "afternoon", "evening"].map((block) => (
          <div key={block} className="mb-4">
            <div className="uppercase text-sm font-bold text-gray-600">{block}</div>
            <div className="font-semibold">{blocks?.[block]?.title || "—"}</div>
            <div className="text-sm text-gray-600">{blocks?.[block]?.desc || "—"}</div>
          </div>
        ))}
      </div>

      <div>
        <label className="block font-medium mb-1">What would you like to change?</label>
        <textarea
          className="w-full p-3 border rounded resize-none"
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="e.g. I'd like something more relaxing in the afternoon, or a different dinner neighborhood."
        />
      </div>

      <button
        onClick={handleRegenerate}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl"
      >
        {loading ? "Regenerating..." : "Regenerate This Day"}
      </button>
    </div>
  );
};

export default DayChanger;
