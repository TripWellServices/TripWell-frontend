import React from "react";
import { useNavigate } from "react-router-dom";

export default function TripAlreadyCreated() {
  const navigate = useNavigate();

  return (
    <div className="max-w-xl mx-auto p-8 space-y-6 text-center">
      <h1 className="text-3xl font-bold text-blue-700">
         Trip Already Created
      </h1>
      <p className="text-gray-700">
        Our records show you already have a trip in progress. Please return home and continue building your itinerary. You've already successfully set it up — congrats!
      </p>
      <button
        onClick={() => navigate("/")}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        🏠 Back to Home
      </button>
    </div>
  );
}
