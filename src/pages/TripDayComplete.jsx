import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TripDayComplete() {
  const [userId, setUserId] = useState(null);
  const [tripId, setTripId] = useState(null);
  const [dayIndex, setDayIndex] = useState(null);
  const [summary, setSummary] = useState("");
  const [moodTag, setMoodTag] = useState("");
  const [journalText, setJournalText] = useState("");
  const navigate = useNavigate();

  const moodOptions = [
    "😄 Full of Memories",
    "😩 Exhausted",
    "😌 Exhausted in a Good Way",
    "🍕 Ate Too Much",
    "😋 Ate Too Much in a Good Way",
    "🧘 Reflective",
    "🤯 Mind Blown",
    "💤 Chill Day",
    "🎢 Rollercoaster"
  ];

  useEffect(() => {
    const hydrate = async () => {
      try {
        const who = await axios.get("/tripwell/whoami");
        const { tripId, userId, dayIndex } = who.data;
        setTripId(tripId);
        setUserId(userId);
        setDayIndex(dayIndex);

        const dayRes = await axios.get(`/tripwell/itinerary/day/${tripId}/${dayIndex}`);
        setSummary(dayRes.data.summary || "");
      } catch (err) {
        console.error("Hydration error in TripDayComplete:", err);
      }
    };

    hydrate();
  }, []);

  const handleSave = async () => {
    try {
      await axios.post(`/tripwell/reflection/${tripId}/${dayIndex}`, {
        summary,
        moodTag,
        journalText
      });
      navigate("/previewliveday");
    } catch (err) {
      console.error("Error saving reflection:", err);
      alert("Failed to save reflection. Try again.");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center text-green-700">
        🎉 You completed Day {dayIndex} in style!
      </h1>
      <p className="text-center text-gray-600">Glad you made it through another day.</p>

      <div className="bg-white p-4 rounded-xl shadow space-y-4">
        <h2 className="text-lg font-semibold">How did it go?</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {moodOptions.map((mood) => (
            <label
              key={mood}
              className={`border rounded-xl px-3 py-2 text-center cursor-pointer ${
                moodTag === mood
                  ? "bg-green-100 border-green-600 font-semibold"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <input
                type="radio"
                name="mood"
                value={mood}
                checked={moodTag === mood}
                onChange={() => setMoodTag(mood)}
                className="hidden"
              />
              {mood}
            </label>
          ))}
        </div>

        <div>
          <textarea
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder="Write any thoughts or reflections that come to mind..."
            className="w-full border rounded-lg p-3 mt-4"
            rows={6}
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-lg"
        >
          ✅ Save Reflection & Preview Tomorrow
        </button>
      </div>
    </div>
  );
}
