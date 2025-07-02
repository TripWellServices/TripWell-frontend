import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const TripModifyDay = () => {
  const { tripId, dayIndex } = useParams();
  const navigate = useNavigate();

  const [tripDay, setTripDay] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [revisedDay, setRevisedDay] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTripDay();
  }, [tripId, dayIndex]);

  const fetchTripDay = async () => {
    try {
      const res = await axios.get(`/tripwell/itinerary/day/${tripId}/${dayIndex}`);
      setTripDay(res.data);
      resetPreview();
    } catch (err) {
      console.error("Failed to load trip day", err);
    }
  };

  const resetPreview = () => {
    setRevisedDay(null);
    setFeedback("");
    setLoading(false);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`/tripwell/modifygpt/day`, {
        tripId,
        dayIndex,
        feedback
      });
      setRevisedDay(res.data);
      setLoading(false);
    } catch (err) {
      console.error("GPT failed to revise", err);
      setLoading(false);
    }
  };

  const handleNavigateToPreview = () => {
    navigate(`/tripwell/modifyreload/${tripId}/${dayIndex}`);
  };

  if (!tripDay) return <div className="p-6">Loading current day data...</div>;

  const displayDay = revisedDay || tripDay;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">🛠 Modify Day {parseInt(dayIndex) + 1}</h2>

      <p className="text-gray-700 mb-4 italic">{displayDay.summary}</p>

      {["morning", "afternoon", "evening"].map((block) => (
        <div key={block} className="mb-4 border rounded-xl p-4 shadow">
          <p className="font-semibold capitalize">{block}:</p>
          <p className="text-gray-800">{displayDay.blocks?.[block]?.title}</p>
          <p className="text-gray-500 text-sm">{displayDay.blocks?.[block]?.desc}</p>
        </div>
      ))}

      {!revisedDay && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Need to change something?</h3>
          <textarea
            className="w-full border rounded-lg p-3 mb-3"
            rows={4}
            placeholder="E.g., skip the museum, add something outdoors"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !feedback}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
          >
            {loading ? "Submitting..." : "🔁 Generate New Itinerary"}
          </button>
        </div>
      )}

      {revisedDay && (
        <div className="mt-6 flex gap-4">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl"
          >
            🔄 Regenerate
          </button>
          <button
            onClick={handleNavigateToPreview}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl"
          >
            ✅ Looks Good
          </button>
        </div>
      )}
    </div>
  );
};

export default TripModifyDay;
