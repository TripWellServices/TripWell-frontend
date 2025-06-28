import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const TripModifierReload = () => {
  const { tripId, dayIndex } = useParams();
  const [tripDay, setTripDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUpdatedDay = async () => {
      try {
        const res = await axios.get(`/tripwell/itinerary/updateday/${tripId}/${dayIndex}`);
        setTripDay(res.data);
      } catch (err) {
        console.error("Failed to fetch updated trip day", err);
        setError("Could not load updated day");
      } finally {
        setLoading(false);
      }
    };

    fetchUpdatedDay();
  }, [tripId, dayIndex]);

  if (loading) return <div className="p-6">Loading updated day...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!tripDay) return <div className="p-6">No updated itinerary found.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🗓️ Updated Day {tripDay.dayIndex}</h2>
      <p className="mb-4 text-gray-700">Review the updated day below. If it's good, save it. If not, you can make another change.</p>

      {Object.entries(tripDay.blocks).map(([timeOfDay, block]) => (
        <div key={timeOfDay} className="border p-4 rounded-xl mb-4 shadow">
          <div className="font-semibold capitalize">{timeOfDay}</div>
          <div className="text-lg font-bold mt-1">{block.title}</div>
          <p className="text-sm text-gray-700 mt-1">{block.desc}</p>
        </div>
      ))}

      <div className="flex justify-between mt-6">
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl"
          onClick={() => window.history.back()}
        >
          Make Another Change
        </button>

        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl"
          onClick={async () => {
            try {
              await axios.post(`/tripwell/itinerary/finalize/${tripId}/${dayIndex}`);
              alert("Day saved to final itinerary!");
            } catch (err) {
              console.error("Failed to finalize day", err);
              alert("Error saving. Try again.");
            }
          }}
        >
          Save This Version
        </button>
      </div>
    </div>
  );
};

export default TripModifierReload;
