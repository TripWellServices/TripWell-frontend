import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function AnchorSelectPage() {
  const navigate = useNavigate();
  const { tripId } = useParams(); // assumes route is /tripwell/:tripId/anchors
  const [anchors, setAnchors] = useState([]);
  const [selected, setSelected] = useState([]);

  // TEMP destination label
  const destination = "your destination"; // upgrade later with `/tripwell/whoami`

  useEffect(() => {
    const exampleAnchors = [
      "Eiffel Tower",
      "Louvre Museum",
      "Montmartre Walk",
      "Day trip to Versailles",
      "Seine River Cruise",
      "Notre Dame (exterior)",
    ];
    setAnchors(exampleAnchors);
  }, []);

  const toggleAnchor = (anchor) => {
    if (selected.includes(anchor)) {
      setSelected(selected.filter((a) => a !== anchor));
    } else if (selected.length < 3) {
      setSelected([...selected, anchor]);
    }
  };

  const handleNext = async () => {
    try {
      const res = await fetch(`https://gofastbackend.onrender.com/tripwell/${tripId}/anchors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ anchors: selected }),
      });

      if (!res.ok) throw new Error("Failed to save anchors");

      navigate(`/tripwell/${tripId}/itinerary`);
    } catch (err) {
      console.error("Failed to save anchors:", err);
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 py-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-center text-green-700 mb-4">
        Pick Your Must-Dos in {destination}
      </h1>
      <p className="text-gray-600 text-center mb-6 max-w-md">
        We’ve pulled some highlights. Choose up to 3 and we’ll plan your trip around them.
      </p>

      <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
        {anchors.map((anchor) => (
          <button
            key={anchor}
            onClick={() => toggleAnchor(anchor)}
            className={`py-2 px-4 rounded shadow ${
              selected.includes(anchor)
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {anchor}
          </button>
        ))}
      </div>

      <button
        onClick={handleNext}
        disabled={selected.length === 0}
        className="mt-8 bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded shadow"
      >
        ✅ Build My Itinerary
      </button>
    </div>
  );
}
