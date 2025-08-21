// src/pages/TripReflectionsHub.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TripReflectionsHub() {
  const navigate = useNavigate();
  const [reflections, setReflections] = useState([]);
  const [city, setCity] = useState("");
  const [tripName, setTripName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get all data from localStorage
    const tripData = localStorage.getItem("tripData");
    const reflectionData = localStorage.getItem("reflectionData");
    
    if (tripData) {
      const parsedTripData = JSON.parse(tripData);
      setCity(parsedTripData.city || "");
      setTripName(parsedTripData.tripName || "Your Trip");
    }

    if (reflectionData) {
      const parsedReflectionData = JSON.parse(reflectionData);
      setReflections(parsedReflectionData || []);
    }

    setLoading(false);
  }, []);

  if (loading) return <div className="p-6 text-center">Loading your trip memories...</div>;
  if (!reflections.length) return (
    <div className="max-w-2xl mx-auto p-8 text-center space-y-6">
      <h1 className="text-3xl font-bold">📓 Your Reflections</h1>
      <p className="text-gray-700 text-lg">No reflections found yet. Complete your trip to see your memories!</p>
      <button
        onClick={() => navigate("/")}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-lg"
      >
        🏠 Return Home
      </button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">✨ Memories from {tripName}</h1>
      <p className="text-center text-gray-600">Here's what made your time in {city} unforgettable.</p>

      <div className="bg-white shadow-md rounded-xl p-4 border">
        {reflections.map((ref, i) => (
          <div key={i} className="mb-6 border-t pt-4">
            <h3 className="text-lg font-bold">Day {ref.dayIndex + 1}</h3>
            <p className="text-gray-800 font-medium mb-1">Summary: {ref.summary}</p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Mood:</span> {ref.moodTag}
            </p>
            <p className="text-gray-800 whitespace-pre-wrap">{ref.journalText}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/")}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-lg"
      >
        🏠 Return Home
      </button>
    </div>
  );
}
