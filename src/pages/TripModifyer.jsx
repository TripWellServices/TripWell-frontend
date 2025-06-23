import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const TripModifyer = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [tripDays, setTripDays] = useState([]);

  useEffect(() => {
    const fetchDays = async () => {
      try {
        const res = await axios.get(`/tripwell/itinerary/days/${tripId}`);
        setTripDays(res.data);
      } catch (err) {
        console.error("Failed to fetch trip days", err);
      }
    };

    fetchDays();
  }, [tripId]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">✏️ Modify Your Trip</h2>
      <p className="mb-6 text-gray-700">
        Select the day you want to change. You can regenerate one day at a time.
      </p>

      <div className="space-y-4">
        {tripDays.map((day) => {
          const actualDate = new Date(day.date || 0);
          const dateStr = actualDate.toDateString(); // fallback if no date

          return (
            <div key={day._id} className="flex justify-between items-center border p-4 rounded-xl shadow">
              <div>
                <div className="font-semibold">Day {day.dayIndex}</div>
                <div className="text-sm text-gray-600">{dateStr}</div>
              </div>
              <button
                onClick={() => navigate(`/tripwell/modifyday/${tripId}/${day.dayIndex}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
              >
                Change this day
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TripModifyer;
