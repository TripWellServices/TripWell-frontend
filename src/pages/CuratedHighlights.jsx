import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

const BACKEND_URL = "https://gofastbackend.onrender.com";

export default function CuratedHighlights() {
  const [highlights, setHighlights] = useState([]);
  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHighlightsAndCity = async () => {
      try {
        const token = await getAuth().currentUser.getIdToken();

        // Fetch GPT highlights
        const highlightRes = await fetch(`${BACKEND_URL}/tripwell/participant/highlights`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const highlightData = await highlightRes.json();
        setHighlights(highlightData || []);

        // Fetch trip meta
        const tripMetaRes = await fetch(`${BACKEND_URL}/tripwell/tripmeta`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tripMeta = await tripMetaRes.json();
        setCity(tripMeta.city || null);
      } catch (err) {
        console.error("❌ Failed to fetch highlights or city", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlightsAndCity();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-blue-700 text-center">✨ Curated Highlights for Your Trip</h1>

      {city && (
        <p className="text-center text-gray-600">
          Looks like you're headed to <span className="font-semibold">{city}</span>.
          Here are 5 things you and your traveling companion(s) may want to think about.
        </p>
      )}

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

      <p className="text-center text-sm text-gray-500 mt-10">
        <a href="/plannerparticipanthub" className="text-blue-600 hover:underline">
          ← Back to TripWell Planning Hub
        </a>
      </p>
    </div>
  );
}
