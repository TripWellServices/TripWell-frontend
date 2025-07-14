import { useEffect, useState } from "react";
import axios from "axios";

export default function TripModifyDay() {
  const tripId = localStorage.getItem("modifyTripId");
  const dayIndex = Number(localStorage.getItem("modifyDayIndex"));

  const [tripDay, setTripDay] = useState(null);
  const [originalDay, setOriginalDay] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [blockFeedback, setBlockFeedback] = useState("");
  const [blockPreview, setBlockPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const res = await axios.get(`/tripwell/modifyday/${tripId}/${dayIndex}`);
        setTripDay(res.data);
        setOriginalDay(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Hydration failed", err);
        setLoading(false);
      }
    };
    hydrate();
  }, [tripId, dayIndex]);

  const handleModifyBlock = async () => {
    try {
      const res = await axios.post(`/tripwell/modifygpt/block`, {
        tripId,
        dayIndex,
        block: selectedBlock,
        feedback: blockFeedback,
        currentBlock: tripDay.blocks[selectedBlock]
      });
      setBlockPreview(res.data.block);
    } catch (err) {
      console.error("Block GPT modify failed", err);
    }
  };

  const handleAcceptBlockChange = () => {
    setTripDay((prev) => ({
      ...prev,
      blocks: {
        ...prev.blocks,
        [selectedBlock]: blockPreview
      }
    }));
    setSelectedBlock(null);
    setBlockFeedback("");
    setBlockPreview(null);
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!tripDay) return <div className="p-6 text-red-600">Trip day not found</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🛠 Modify Trip Day</h1>
      <p className="text-gray-600 italic mb-6">{tripDay.summary}</p>

      {["morning", "afternoon", "evening"].map((slot) => (
        <div key={slot} className="mb-6 p-4 border rounded-xl shadow">
          <h3 className="font-semibold capitalize">{slot}</h3>
          <p className="text-gray-800">{tripDay.blocks[slot]?.title || "(No title)"}</p>
          <p className="text-gray-600">{tripDay.blocks[slot]?.desc || "(No description)"}</p>
          <button
            onClick={() => setSelectedBlock(slot)}
            className="mt-2 text-sm text-blue-700 underline"
          >
            ✏️ Modify this block
          </button>
        </div>
      ))}

      {selectedBlock && (
        <div className="mt-6 border-t pt-6">
          <h2 className="text-lg font-semibold mb-2">Modify {selectedBlock} block</h2>
          <textarea
            value={blockFeedback}
            onChange={(e) => setBlockFeedback(e.target.value)}
            className="w-full border rounded p-2 mb-3"
            placeholder="What do you want to change about this block?"
          />
          <button
            onClick={handleModifyBlock}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl"
          >
            🔁 Ask Angela
          </button>

          {blockPreview && (
            <div className="mt-4 border p-4 bg-gray-100 rounded-xl">
              <h4 className="font-semibold">Preview:</h4>
              <p className="text-gray-800">{blockPreview.title}</p>
              <p className="text-gray-600">{blockPreview.desc}</p>
              <button
                onClick={handleAcceptBlockChange}
                className="mt-3 bg-green-600 text-white px-4 py-2 rounded-xl"
              >
                ✅ Accept This Change
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
