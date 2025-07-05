// src/pages/TripReflection.jsx

import { useEffect, useState } from "react";
import axios from "axios";

export default function TripReflection() {
  const [reflectionData, setReflectionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReflections() {
      try {
        const res = await axios.get("/tripwell/reflections/latest");
        setReflectionData(res.data);
      } catch (err) {
        console.error("Failed to load reflections:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReflections();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading your trip memories...</div>;
  if (!reflectionData) return <div className="p-6 text-center">No reflections found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">✨ Trip Reflections</h1>
      <p className="text-center text-gray-600">
        TripWell lives to build memories. Take a look below at what made this last trip special.
      </p>

      <div className="bg-white shadow-md rounded-xl p-4 border">
        <p className="text-lg font-semibold">Trip: {reflectionData.tripName}</p>
        <p className="text-sm text-gray-500 mb-4">Completed on: {new Date(reflectionData.completedDate).toLocaleDateString()}</p>

        {reflectionData.reflections.map((ref, i) => (
          <div key={i} className="mb-6 border-t pt-4">
            <h3 className="text-lg font-bold">Day {ref.dayIndex + 1}</h3>
            <p className="text-gray-700 italic mb-1">"{ref.summary}"</p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Mood:</span> {ref.moodTag}
            </p>
            <p className="text-gray-800 whitespace-pre-wrap">{ref.journalText}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
