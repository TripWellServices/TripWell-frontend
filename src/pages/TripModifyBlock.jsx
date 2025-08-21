import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function TripModifyBlock() {
  const { tripId, dayIndex, timeOfDay } = useParams();
  const navigate = useNavigate();

  const [originalBlock, setOriginalBlock] = useState(null);
  const [modifiedBlock, setModifiedBlock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    function hydrate() {
      try {
        // Get itinerary data from localStorage
        const itineraryData = localStorage.getItem("itineraryData");
        if (!itineraryData) {
          setError("No itinerary data found.");
          setLoading(false);
          return;
        }

        const parsedItinerary = JSON.parse(itineraryData);
        const days = parsedItinerary.days || [];
        
        // Find the specific day by dayIndex
        const targetDay = days.find(day => day.dayIndex === parseInt(dayIndex));
        
        if (!targetDay) {
          setError(`Day ${dayIndex} not found.`);
          setLoading(false);
          return;
        }

        // Get the specific block
        const block = targetDay.blocks?.[timeOfDay];
        if (!block) {
          setError(`${timeOfDay} block not found.`);
          setLoading(false);
          return;
        }

        setOriginalBlock(block);
        setModifiedBlock({ ...block }); // Create a copy for editing
      } catch (err) {
        console.error("❌ Failed to hydrate block from localStorage", err);
        setError("Could not load block data.");
      } finally {
        setLoading(false);
      }
    }

    hydrate();
  }, [dayIndex, timeOfDay]);

  const handleAskAngela = async () => {
    try {
      const res = await axios.post(`/tripwell/modifygpt/block`, {
        tripId,
        dayIndex,
        block: blockName,
        feedback,
        currentBlock: originalBlock,
      });
      setPreviewBlock(res.data.block);
    } catch (err) {
      console.error("❌ GPT modify failed", err);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.post(`/tripwell/savefinalblock`, {
        tripId,
        dayIndex,
        blockName,
        blockData: previewBlock,
      });
      // ✅ FIX: Navigate directly back to overview (no loop!)
      navigate(`/tripwell/itineraryupdate`);
    } catch (err) {
      console.error("❌ Save failed", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!originalBlock) return <div className="p-6 text-red-600">Block not found.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-2">🛠 Modify "{blockName}" block</h2>
      
      {/* ✅ ADD: Back button */}
      <div className="mb-4">
        <button
          onClick={() => navigate(`/tripwell/itineraryupdate`)}
          className="text-sm text-gray-500 underline"
        >
          ← Back to All Days
        </button>
      </div>

      <div className="mb-4">
        <h3 className="text-md font-semibold">Original</h3>
        <p className="text-sm text-gray-700">{originalBlock.title}</p>
        <p className="text-xs text-gray-500">{originalBlock.desc}</p>
      </div>

      <textarea
        className="w-full border rounded p-2 text-sm mb-3"
        rows={4}
        placeholder="Tell Angela what you'd like to change..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />

      <button
        onClick={handleAskAngela}
        disabled={!feedback}
        className="bg-blue-600 text-white px-4 py-2 rounded-xl"
      >
        🔁 Ask Angela
      </button>

      {previewBlock && (
        <div className="mt-6 border-t pt-4">
          <h3 className="font-semibold text-green-700">Preview</h3>
          <p className="text-sm text-gray-800">{previewBlock.title}</p>
          <p className="text-xs text-gray-600">{previewBlock.desc}</p>

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-3 bg-green-600 text-white px-4 py-2 rounded-xl"
          >
            ✅ Save This Block
          </button>
        </div>
      )}
    </div>
  );
}
