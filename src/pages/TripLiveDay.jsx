import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function TripLiveDay() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dayData, setDayData] = useState(null);
  const [currentBlock, setCurrentBlock] = useState(null);
  const [currentDayIndex, setCurrentDayIndex] = useState(null);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const { data } = await axios.get(`/tripwell/livestatus/${tripId}`);

        if (data.tripComplete) {
          navigate("/tripcomplete");
          return;
        }

        setCurrentDayIndex(data.currentDayIndex);
        setCurrentBlock(data.currentBlock);
        setDayData(data.dayData);
        setLoading(false);
      } catch (err) {
        console.error("❌ Failed to load live trip day", err);
        setLoading(false);
      }
    };

    hydrate();
  }, [tripId, navigate]);

  if (loading) {
    return <div className="p-6 text-center">Loading today’s plan...</div>;
  }

  if (!dayData) {
    return <div className="p-6 text-center">Couldn’t load today’s itinerary.</div>;
  }

  const { city, dateStr, summary, blocks } = dayData;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="text-sm text-gray-500 mb-2">
        📍 {city} • {dateStr || "Unknown date"} • Day {currentDayIndex}
      </div>

      <h1 className="text-2xl font-bold mb-4">Here’s today’s plan — ready to begin?</h1>
      <p className="italic text-gray-700 mb-6">{summary}</p>

      <div className="grid gap-4 mb-8">
        {["morning", "afternoon", "evening"].map((slot) => (
          <div key={slot} className="border rounded-xl p-4 shadow">
            <h3 className="font-semibold capitalize">{slot}</h3>
            <p className="text-gray-800">{blocks?.[slot]?.title || "(No title)"}</p>
            <p className="text-gray-500 text-sm">{blocks?.[slot]?.desc || "(No description)"}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={() => {
            navigate("/tripliveblock", {
              state: {
                blockName: currentBlock,
                dayIndex: currentDayIndex,
                blockData: blocks?.[currentBlock]
              }
            });
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-lg"
        >
          ✅ Let’s Go
        </button>
      </div>
    </div>
  );
}