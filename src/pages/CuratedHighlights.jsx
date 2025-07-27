import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

const BACKEND_URL = "https://gofastbackend.onrender.com";

export default function CuratedHighlights() {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const token = await getAuth().currentUser.getIdToken();
        const res = await fetch(`${BACKEND_URL}/tripwell/participant/highlights`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setHighlights(data || []);
      } catch (err) {
        console.error("❌ Failed to fetch highlights", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlights();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-blue-700 text-center">✨ Curated Highlights for Your Trip</h1>
      <p className="text-gray-600 text-center">
        Based on your travel vibes, here are a few inspiring ideas. See something you love? Tell your trip planner!
      </p>

      {loading ? (
        <p className="text-center mt-6">Loading highlights...</p>
      ) : highlights.length > 0 ? (
        <div className="grid gap-4">
          {highlights.map((item, idx) => (
            <div key={idx} className="border p-4 rounded bg-white shadow-sm">
              <h2 className="font-semibold text-lg text-blue-600">{item.title}</h2>
              <p className="text-gray-700 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-6">No highlights yet. Try again later.</p>
      )}

      <div className="text-center mt-10">
        <button
          onClick={() => (window.location.href = "/tripwell/plannerparticipanthub")}
          className="bg-gray-200 hover:bg-gray-300 text-black px-6 py-2 rounded"
        >
          ⬅️ Return to Your TripWell Planning Home
        </button>
      </div>
    </div>
  );
}
