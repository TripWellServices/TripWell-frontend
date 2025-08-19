import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import BACKEND_URL from "../config";

export default function TripDaysOverview() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDays() {
      try {
        // Prefer server truth using auth token
        const firebaseUser = auth.currentUser;
        const token = firebaseUser ? await firebaseUser.getIdToken(true) : null;

        let tripId = null;
        if (token) {
          const statusRes = await fetch(`${BACKEND_URL}/tripwell/tripstatus`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          });
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            tripId = statusData?.tripId || null;
          }
        }

        // Fallback to localStorage if server status didn’t provide tripId
        if (!tripId) {
          const localTrip = JSON.parse(localStorage.getItem("tripData") || "null");
          tripId = localTrip?.tripId || localTrip?._id || null;
        }

        if (!tripId) {
          navigate("/tripwell/tripitineraryrequired");
          return;
        }

        // Fetch days from backend (itinerary days endpoint)
        const daysRes = await fetch(`${BACKEND_URL}/tripwell/itinerary/days/${tripId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          cache: "no-store",
        });
        if (!daysRes.ok) throw new Error(`Days fetch failed: ${daysRes.status}`);
        const data = await daysRes.json();
        setDays(data || []);
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

      <div className="mt-8 flex flex-col gap-4 items-center">
        <button
          onClick={() => navigate("/")}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl shadow"
        >
          ✅ Return Home
        </button>

        <div className="w-full max-w-xl bg-blue-50 text-blue-800 rounded-lg p-3 text-center text-sm">
          On the Home screen, look for <span className="font-semibold">“Start My Trip”</span> when you're ready to begin.
        </div>
      </div>
    </div>
  );
}
