import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function TripLiveDay() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modifyText, setModifyText] = useState("");
  const [gptResponse, setGptResponse] = useState(null);
  const [modified, setModified] = useState(false);
  const [showNextPrompt, setShowNextPrompt] = useState(false);

  useEffect(() => {
    fetchLiveDay();
  }, [tripId]);

  async function fetchLiveDay() {
    try {
      const { data } = await axios.get(`/tripwell/triplive/${tripId}`);
      setToday(data);
      resetPreview();
      setLoading(false);
    } catch (err) {
      console.error("❌ Failed to load today’s plan", err);
      setToday(null);
      setLoading(false);
    }
  }

  function resetPreview() {
    setGptResponse(null);
    setModifyText("");
    setModified(false);
    setShowNextPrompt(false);
  }

  const handleModify = async () => {
    try {
      const { data } = await axios.post(`/tripwell/modifygpt/day`, {
        tripId,
        dayIndex: today.dayIndex,
        feedback: modifyText,
      });
      setGptResponse(data);
      setModified(true);
      setModifyText("");
    } catch (err) {
      console.error("❌ GPT preview failed", err);
    }
  };

  const handleAccept = async () => {
    try {
      await axios.post(`/tripwell/parseandsave/${tripId}/${today.dayIndex}`, {
        gptOutput: gptResponse,
      });
      resetPreview();
      setShowNextPrompt(true);
    } catch (err) {
      console.error("❌ Failed to save GPT-modified day", err);
    }
  };

  const handleMarkComplete = async () => {
    try {
      await axios.post(`/tripwell/markcomplete/${tripId}/${today.dayIndex}`);
      resetPreview();
      setShowNextPrompt(true);
    } catch (err) {
      console.error("❌ Error marking day complete", err);
    }
  };

  const handleShowNextDay = async () => {
    setLoading(true);
    await fetchLiveDay();
  };

  if (loading) return <div className="p-6">Loading today’s itinerary...</div>;
  if (!today) return <div className="p-6 text-lg">🎉 That’s it — your trip is complete!</div>;

  const dayLabel = `Day ${today.dayIndex + 1}`;
  const dateStr = today.dateStr || "(no date)";
  const blocks = modified && gptResponse ? gptResponse.blocks : today.blocks;
  const summary = modified && gptResponse ? gptResponse.summary : today.summary;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">🌞 Happy Traveling!</h2>
      <p className="text-gray-700 mb-6">Here’s your outlook for today.</p>

      <div className="mb-2 text-sm text-gray-500">{dayLabel} • {dateStr}</div>
      <p className="italic text-gray-600 mb-4">{summary}</p>

      <div className="grid gap-4 mb-8">
        {Object.entries(blocks).map(([slot, block]) => (
          <div key={slot} className="border rounded-xl p-4 shadow">
            <h3 className="font-semibold capitalize">{slot}</h3>
            <p className="text-gray-800">{block?.title || "(No title)"}</p>
            <p className="text-gray-500 text-sm">{block?.desc || "(No description)"}</p>
          </div>
        ))}
      </div>

      {!modified && !showNextPrompt && (
        <div className="mb-10 border-t pt-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-800">Need to change something?</h3>
          <p className="text-sm text-blue-700 mb-2">
            Let us know what needs to be swapped — Angela will rebuild the day.
          </p>
          <textarea
            className="w-full border rounded p-2 mb-2"
            rows={3}
            placeholder="E.g., Louvre is closed — can we replace it?"
            value={modifyText}
            onChange={(e) => setModifyText(e.target.value)}
          />
          <button
            onClick={handleModify}
            disabled={!modifyText}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
          >
            🔁 Update Itinerary
          </button>
        </div>
      )}

      {modified && gptResponse && !showNextPrompt && (
        <div className="mb-10 flex gap-4">
          <button
            onClick={handleModify}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl"
          >
            🔄 Update Again
          </button>
          <button
            onClick={handleAccept}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl"
          >
            ✅ Looks Good
          </button>
        </div>
      )}

      {showNextPrompt && (
        <div className="border-t pt-6 mt-6 text-center">
          <p className="text-lg font-medium mb-4">✅ All set for today.</p>
          <button
            onClick={handleShowNextDay}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl"
          >
            ➡️ Show Next Day
          </button>
        </div>
      )}

      {!showNextPrompt && (
        <div className="border-t pt-6 flex flex-col gap-4">
          <button
            onClick={handleMarkComplete}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl"
          >
            ✅ This Day is Complete
          </button>
          <button
            onClick={() => navigate(`/tripwell/journal/${tripId}/${today.dayIndex}`)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl"
          >
            📓 Journal It
          </button>
        </div>
      )}
    </div>
  );
}
