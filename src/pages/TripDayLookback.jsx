import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TripDayLookback() {
  const [tripData, setTripData] = useState(null);
  const [moodTag, setMoodTag] = useState("");
  const [journalText, setJournalText] = useState("");
  const navigate = useNavigate();

  const moodOptions = [
    "😄 Full of Memories", "😩 Exhausted", "😌 Exhausted in a Good Way",
    "🍕 Ate Too Much", "😋 Ate Too Much in a Good Way", "🧘 Reflective",
    "🤯 Mind Blown", "💤 Chill Day", "🎢 Rollercoaster"
  ];

  // Hydrate tripData
  useEffect(() => {
    const hydrate = async () => {
      try {
        const res = await axios.get("/tripwell/livestatus");
        localStorage.setItem("tripData", JSON.stringify(res.data));
        setTripData(res.data);
      } catch {
        setTripData(JSON.parse(localStorage.getItem("tripData") || "null"));
      }
    };
    hydrate();
  }, []);

  const handleSave = async () => {
    if (!tripData) return;
    try {
      await axios.post(`/tripwell/reflection/${tripData.tripId}/${tripData.currentDay}`, {
        moodTag,
        journalText
      });

      // Save locally too
      const existing = localStorage.getItem("reflectionData");
      const reflections = existing ? JSON.parse(existing) : [];
      reflections.push({
        dayIndex: tripData.currentDay,
        moodTag,
        journalText,
        summary: `Day ${tripData.currentDay} reflection`
      });
      localStorage.setItem("reflectionData", JSON.stringify(reflections));

      if (tripData.tripComplete) navigate("/tripcomplete");
      else navigate("/tripliveday");
    } catch (err) {
      console.error("❌ Reflection save failed:", err);
      alert("Could not save your reflection.");
    }
  };

  if (!tripData) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center text-green-700">
        🎉 You finished Day {tripData.currentDay}!
      </h1>

      <div className="bg-white p-4 rounded-xl shadow space-y-4">
        <h2 className="text-lg font-semibold">What vibe captures today?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {moodOptions.map((mood) => (
            <label
              key={mood}
              className={`border rounded-xl px-3 py-2 text-center cursor-pointer ${
                moodTag === mood ? "bg-green-100 border-green-600 font-semibold" : "bg-gray-50"
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

        <textarea
          value={journalText}
          onChange={(e) => setJournalText(e.target.value)}
          placeholder="Write down your thoughts..."
          className="w-full border rounded-lg p-3 mt-4"
          rows={6}
        />

        <button
          onClick={handleSave}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-lg"
        >
          ✅ Save Reflection
        </button>
      </div>
    </div>
  );
}
