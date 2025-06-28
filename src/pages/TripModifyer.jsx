// TripModifyer.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const TripModifyer = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [dayCards, setDayCards] = useState([]);

  useEffect(() => {
    const fetchTripBase = async () => {
      try {
        const res = await axios.get(`/tripwell/tripbase/${tripId}`);
        const { startDate, daysTotal } = res.data;
        const baseDate = new Date(startDate);

        const cards = Array.from({ length: daysTotal }, (_, i) => {
          const date = new Date(baseDate);
          date.setDate(baseDate.getDate() + i);
          return {
            dayIndex: i,
            dayLabel: `Day ${i + 1}`,
            dateStr: date.toDateString()
          };
        });

        setDayCards(cards);
      } catch (err) {
        console.error("Failed to fetch trip base info", err);
      }
    };

    fetchTripBase();
  }, [tripId]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">✏️ Modify Your Trip</h2>
      <p className="mb-6 text-gray-700">
        Select the day you want to change. You can regenerate one day at a time.
      </p>

      <div className="space-y-4">
        {dayCards.map((day) => (
          <div key={day.dayIndex} className="flex justify-between items-center border p-4 rounded-xl shadow">
            <div>
              <div className="font-semibold">{day.dayLabel}</div>
              <div className="text-sm text-gray-600">{day.dateStr}</div>
            </div>
            <button
              onClick={() => navigate(`/tripwell/modifyday/${tripId}/${day.dayIndex}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
            >
              Change this day
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TripModifyer;
