import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const TripModifyDay = () => {
  const { tripId, dayIndex } = useParams();
  const [tripDay, setTripDay] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [revisedDay, setRevisedDay] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTripDay = async () => {
      try {
        const res = await axios.get(`/tripwell/itinerary/day/${tripId}/${dayIndex}`);
        setTripDay(res.data);
      } catch (err) {
        console.error("Failed to load trip day", err);
      }
    };

    fetchTripDay();
  }, [tripId, dayIndex]);

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

  const handleSave = async () => {
    try {
      await axios.post(`/tripwell/itinerary/day/save`, {
        tripId,
        dayIndex,
        ...revisedDay
      });
      alert("Day saved!");
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  if (!tripDay) return <div>Loading current day data...</div>;

  const displayDay = revisedDay || tripDay;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">🛠 Modify Day {dayIndex}</h2>

      <div className="mb-6">
        <p className="text-gray-700 font-semibold mb-1">Current Summary:</p>
        <p className="text-gray-600 mb-4">{tripDay.summary}</p>

        {["morning", "afternoon", "evening"].map((block) => (
          <div key={block} className="mb-3">
            <p className="font-semibold capitalize">{block}:</p>
            <p className="text-gray-600 italic">{tripDay.blocks?.[block]?.title}</p>
            <p className="text-gray-500 text-sm">{tripDay.blocks?.[block]?.desc}</p>
          </div>
        ))}
      </div>

      <textarea
        className="w-full border rounded-lg p-3 mb-4"
        rows={4}
        placeholder="What would you like to change about this day?"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded-xl mr-4"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Send to GPT"}
      </button>

      {revisedDay && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-bold mb-2">✨ Revised Day</h3>
          <p className="text-gray-700 mb-2">{revisedDay.summary}</p>

          {["morning", "afternoon", "evening"].map((block) => (
            <div key={block} className="mb-3">
              <p className="font-semibold capitalize">{block}:</p>
              <p className="text-gray-600 italic">{revisedDay.blocks?.[block]?.title}</p>
              <p className="text-gray-500 text-sm">{revisedDay.blocks?.[block]?.desc}</p>
            </div>
          ))}

          <button
            onClick={handleSave}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-xl"
          >
            Save This Version
          </button>
        </div>
      )}
    </div>
  );
};

export default TripModifyDay;