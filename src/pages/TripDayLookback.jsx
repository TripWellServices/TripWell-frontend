import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TripDayLookback() {
  const [userId, setUserId] = useState(null);
  const [tripId, setTripId] = useState(null);
  const [dayIndex, setDayIndex] = useState(null);
  const [tripComplete, setTripComplete] = useState(false);
  const [city, setCity] = useState("");
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
        const whoRes = await axios.get("/tripwell/whoami");
        setUserId(whoRes.data.userId);

        const tripStatus = await axios.get(`/tripwell/lookback/${whoRes.data.userId}`);
        const { tripId, dayIndex, tripComplete, city } = tripStatus.data;

        setTripId(tripId);
        setDayIndex(dayIndex);
        setTripComplete(tripComplete);
        setCity(city || "your destination");
      } catch (err) {
        console.error("Lookback hydration error:", err);
      }
    };

    hydrate();
  }, []);

  const handleSave = async () => {
    try {
      await axios.post(`/tripwell/reflection/${tripId}/${dayIndex}`, {
        moodTag,
        journalText
      });

      if (tripComplete) {
        navigate("/tripcomplete");
      } else {
        navigate("/previewliveday");
      }
    } catch (err) {
      console.error("Reflection save failed:", err);
      alert("Could not save your reflection.");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center text-green-700">
        🎉 You just finished another day in {city}!
      </h1>
      <p className="text-center text-gray-600">
        Take a moment to reflect on what made today special.
      </p>

      <div className="bg-white p-4 rounded-xl shadow space-y-4">
        <h2 className="text-lg font-semibold">What vibe captures today?</h2>

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
            placeholder="Write down your thoughts, highlights, or any funny moments..."
            className="w-full border rounded-lg p-3 mt-4"
            rows={6}
          />
        </div>

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
