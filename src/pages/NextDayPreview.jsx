// src/pages/NextDayPreview.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function NextDayPreview() {
  const [tripId, setTripId] = useState(null);
  const [dayIndex, setDayIndex] = useState(null);
  const [city, setCity] = useState("");
  const [tripDay, setTripDay] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const hydrate = async () => {
      try {
        const statusRes = await axios.get("/tripwell/tripstatus");
        const tripIdFromStatus = statusRes.data.tripId;
        const nextDayIndex = statusRes.data.nextDayIndex;

        if (!tripIdFromStatus || typeof nextDayIndex !== "number") {
          console.error("Missing tripId or day index in trip status");
          return;
        }

        setTripId(tripIdFromStatus);
        setDayIndex(nextDayIndex);

        const dayRes = await axios.get(`/tripwell/itinerary/day/${tripIdFromStatus}/${nextDayIndex}`);
        setTripDay(dayRes.data);
        setCity(dayRes.data.city || "your destination");
      } catch (err) {
        console.error("NextDayPreview hydration error:", err);
      }
    };

    hydrate();
  }, []);

  if (!tripDay) return <div className="p-6">Loading tomorrow’s plan...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6 text-center">
      <h1 className="text-3xl font-bold">🌅 Coming Up: Day {dayIndex} in {city}</h1>
      <p className="text-gray-600 text-lg">Here's a look at what you have planned for tomorrow. We're excited for your upcoming experiences.</p>

      <div className="bg-white shadow rounded-xl p-6 text-left space-y-4">
        <h2 className="text-xl font-semibold">📌 Summary</h2>
        <p className="text-gray-800">{tripDay.summary}</p>

        {["morning", "afternoon", "evening"].map((slot) => (
          <div key={slot} className="pt-4 border-t">
            <h3 className="text-lg font-bold capitalize">{slot}</h3>
            <p className="font-semibold text-gray-900">{tripDay.blocks[slot]?.title || "Untitled"}</p>
            <p className="text-gray-700">{tripDay.blocks[slot]?.desc || "No description"}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/tripwell/home")}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-lg"
      >
        ✅ Ready for Tomorrow
      </button>
    </div>
  );
}
