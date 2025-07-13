import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TripDaysOverview() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDays() {
      try {
        const statusRes = await axios.get("/tripwell/tripstatus");
        const { tripId } = statusRes.data;

        if (!tripId) {
          navigate("/tripwell/tripitineraryrequired");
          return;
        }

        const res = await axios.get(`/tripwell/modifydays/${tripId}`);
        setDays(res.data || []);
      } catch (err) {
        console.error("Failed to fetch trip days for overview:", err);
        setError("Could not load trip days.");
      } finally {
        setLoading(false);
      }
    }

    fetchDays();
  }, [navigate]);

  if (loading) return <p className="p-4">Loading trip days...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Trip Day Overview</h2>
      <p className="mb-4 text-sm text-gray-600">
        You can update any day. Or return home if you’re done.
      </p>

      <div className="space-y-4">
        {days.map((day) => (
          <div
            key={day.dayIndex}
            className="border rounded-lg p-4 shadow-sm hover:shadow transition"
          >
            <h3 className="font-semibold mb-1">Day {day.dayIndex}</h3>
            <p className="italic text-sm mb-2">{day.summary}</p>
            <button
              onClick={() => {
                localStorage.setItem("modifyDayIndex", day.dayIndex);
                navigate("/tripwell/modify/day");
              }}
              className="text-sm text-blue-600 underline"
            >
              Modify this day
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <button
          onClick={() => navigate("/tripwell/home")}
          className="bg-green-600 text-white px-4 py-2 rounded-xl"
        >
          ✅ Return Home
        </button>

        <p className="text-xs text-center text-gray-500">
          On the Home screen, look for{" "}
          <strong>“Start My Trip”</strong> when you're ready to begin.
        </p>
      </div>
    </div>
  );
}
