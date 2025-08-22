import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BACKEND_URL from "../config";

export default function LastDayReflection() {
  const navigate = useNavigate();
  const [tripId, setTripId] = useState(null);
  const [dayIndex, setDayIndex] = useState(null);

  const [favoriteMoment, setFavoriteMoment] = useState("");
  const [laughMoment, setLaughMoment] = useState("");
  const [cryMoment, setCryMoment] = useState("");
  const [finalThoughts, setFinalThoughts] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function hydrate() {
      try {
        const whoRes = await axios.get(`${BACKEND_URL}/tripwell/whoami`);
        const statusRes = await axios.get(`${BACKEND_URL}/tripwell/tripstatus`);

        if (whoRes.data && statusRes.data) {
          setTripId(statusRes.data.tripId);
          setDayIndex(statusRes.data.totalDays); // last day index
        }
      } catch (err) {
        console.error("Failed to hydrate last day reflection:", err);
      } finally {
        setLoading(false);
      }
    }

    hydrate();
  }, []);

  async function handleSubmit() {
    const journalText = `
💫 Favorite Moment:
${favoriteMoment.trim()}

😂 What Made You Laugh:
${laughMoment.trim()}

😢 What Made You Cry (or almost):
${cryMoment.trim()}

🧠 Final Thoughts or Lessons:
${finalThoughts.trim()}
    `.trim();

    try {
      await axios.post(`${BACKEND_URL}/tripwell/reflection/${tripId}/${dayIndex}`, {
        summary: `Final reflection for day ${dayIndex}`,
        journalText,
        moodTag: "reflective",
      });

      navigate(`/tripwell/tripcomplete/${tripId}`);
    } catch (err) {
      console.error("Failed to save final reflection:", err);
      alert("Something went wrong saving your reflection. Please try again.");
    }
  }

  if (loading) return <div className="p-6 text-center">Loading final reflection screen...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">🧳 Your Journey, Remembered</h1>
      <p className="text-center text-gray-600">
        This is your final reflection. Take a moment to relive what mattered most.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">💫 What was your favorite moment?</label>
          <textarea
            className="w-full p-3 border rounded-xl"
            rows="3"
            value={favoriteMoment}
            onChange={(e) => setFavoriteMoment(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">😂 What made you laugh?</label>
          <textarea
            className="w-full p-3 border rounded-xl"
            rows="3"
            value={laughMoment}
            onChange={(e) => setLaughMoment(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">😢 What made you cry (or almost)?</label>
          <textarea
            className="w-full p-3 border rounded-xl"
            rows="3"
            value={cryMoment}
            onChange={(e) => setCryMoment(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">🧠 Any final thoughts or lessons?</label>
          <textarea
            className="w-full p-3 border rounded-xl"
            rows="4"
            value={finalThoughts}
            onChange={(e) => setFinalThoughts(e.target.value)}
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-lg mt-6"
        >
          ✨ Save My Reflection
        </button>
      </div>
    </div>
  );
}
