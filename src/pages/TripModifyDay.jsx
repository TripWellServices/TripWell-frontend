import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function TripModifyDay() {
  const { tripId, dayIndex } = useParams();
  const navigate = useNavigate();

  const [tripDay, setTripDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function hydrate() {
      try {
        const res = await axios.get(`/tripwell/modifyday/${tripId}/${dayIndex}`);
        setTripDay(res.data);
      } catch (err) {
        console.error("❌ Failed to hydrate day", err);
        setError("Could not load day.");
      } finally {
        setLoading(false);
      }
    }

    hydrate();
  }, [tripId, dayIndex]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!tripDay) return <div className="p-6 text-gray-600">No data found.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">🛠 Modify Day {dayIndex}</h1>
      <p className="italic text-sm text-gray-600 mb-6">{tripDay.summary}</p>

      {["morning", "afternoon", "evening"].map((part) => {
        const block = tripDay.blocks?.[part];
        if (!block) return null;

        return (
          <div key={part} className="mb-6 p-4 border rounded-xl shadow">
            <h3 className="font-semibold capitalize mb-1">{part}</h3>
            <p className="text-gray-800 text-sm font-medium">{block.title}</p>
            <p className="text-gray-600 text-sm">{block.desc}</p>
            <button
              onClick={() =>
                navigate(`/tripwell/modifyblock/${tripId}/${dayIndex}/${part}`)
              }
              className="mt-2 text-sm text-blue-700 underline"
            >
              ✏️ Edit This Block
            </button>
          </div>
        );
      })}

      <div className="mt-8">
        <button
          onClick={() => navigate("/tripwell/modifydays")}
          className="text-sm text-gray-500 underline"
        >
          ← Back to All Days
        </button>
      </div>
    </div>
  );
}
