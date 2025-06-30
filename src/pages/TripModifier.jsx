// TripModifyDay.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const TripModifyDay = () => {
  const { tripId, dayIndex } = useParams();
  const navigate = useNavigate();
  const [tripDay, setTripDay] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [revisedDay, setRevisedDay] = useState(null);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);

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
      const res = await axios.post(`/tripwell/modifyday/${tripId}/${dayIndex}`, {
        feedback,
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
      await axios.post(`/tripwell/itinerary/finalize/${tripId}/${dayIndex}`);
      alert("Day saved!");
      navigate(`/tripwell/modify`);
    } catch (err) {
      console.error("Save failed", err);
      alert("Error saving. Try again.");
    }
  };

  const handleModifyAgain = () => {
    setFeedback("");
    setRevisedDay(null);
    textareaRef.current?.focus();
  };

  if (!tripDay) return <div className="p-6">Loading current day data...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">🛠 Modify Day {parseInt(dayIndex) + 1}</h2>

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
        ref={textareaRef}
        className="w-full border rounded-lg p-3 mb-4"
        rows={4}
        placeholder="What would you like to change about this day?"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded-xl"
        disabled={loading || !feedback.trim()}
      >
        {loading ? "Submitting..." : "Update My Itinerary"}
      </button>

      {revisedDay && (
        <div className="mt-8 border-t pt-4">
          <h3 className="text-lg font-bold mb-2">✨ Revised Itinerary Preview</h3>
          <p className="text-gray-700 mb-2">{revisedDay.summary}</p>

          {["morning", "afternoon", "evening"].map((block) => (
            <div key={block} className="mb-3">
              <p className="font-semibold capitalize">{block}:</p>
              <p className="text-gray-600 italic">{revisedDay.blocks?.[block]?.title}</p>
              <p className="text-gray-500 text-sm">{revisedDay.blocks?.[block]?.desc}</p>
            </div>
          ))}

          <div className="flex gap-4 mt-4">
            <button
              onClick={handleModifyAgain}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl"
            >
              Modify Again
            </button>

            <button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl"
            >
              Save This Version
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripModifyDay;