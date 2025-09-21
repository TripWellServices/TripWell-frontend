import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import BACKEND_URL from "../config";
import { fetchJSON } from "../utils/fetchJSON";

export default function TripCreated() {
  const navigate = useNavigate();
  
  // Get trip data from localStorage (already saved during trip creation)
  const tripData = JSON.parse(localStorage.getItem("tripData") || "null");
  const userData = JSON.parse(localStorage.getItem("userData") || "null");
  
  // If no cached data, redirect back to trip setup
  if (!tripData || !userData) {
    console.error("❌ No trip data found, redirecting to trip setup");
    navigate("/tripsetup");
    return null;
  }

  if (!tripData) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        🚫 Could not load trip.
      </div>
    );
  }

  const shareMessage = `Hey! Join me on TripWell to plan our ${tripData.city} trip.\n\n🔑 Trip Join Code: ${tripData.joinCode || tripData.tripId}\n\nUse this code to join my trip planning! Go to: https://tripwell.app`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareMessage);
    alert("Message copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-300 to-blue-200 flex items-center justify-center p-6">
      <div className="max-w-xl w-full space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
      <h1 className="text-3xl font-bold text-center text-green-700">
        🎉 Your Trip Is Ready
      </h1>

      <div className="bg-white shadow rounded-lg p-4 space-y-2 border text-sm">
        <p><strong>Trip Name:</strong> {tripData.tripName}</p>
        <p><strong>Purpose:</strong> {tripData.purpose || "—"}</p>
        <p><strong>Destination:</strong> {tripData.city}</p>
        <p><strong>Dates:</strong> {new Date(tripData.startDate).toLocaleDateString()} – {new Date(tripData.endDate).toLocaleDateString()}</p>
        <p><strong>Party Count:</strong> {tripData.partyCount}</p>
        <p><strong>With:</strong> {tripData.whoWith ? tripData.whoWith.charAt(0).toUpperCase() + tripData.whoWith.slice(1).replace('-', ' ') : "—"}</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm font-medium text-blue-800 mb-1">🔑 Your Trip Join Code</p>
          <p className="font-mono text-lg font-bold text-blue-600">{tripData.joinCode || tripData.tripId}</p>
          <p className="text-xs text-blue-700 mt-1">Share this code with your travel companions so they can join your trip!</p>
        </div>
      </div>

      <div className="space-y-4 text-gray-700">
        <h2 className="text-xl font-semibold">Invite Others</h2>
        <textarea
          value={shareMessage}
          readOnly
          className="w-full border rounded p-2 bg-gray-50 font-mono text-sm"
          rows={4}
        />
        <button
          onClick={handleCopy}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          📋 Copy Invite Message
        </button>
      </div>

      <div className="space-y-4 text-center">
        <p className="text-lg font-semibold text-gray-800">
          Ready to plan the rest of your trip?
        </p>
        <button
          onClick={() => navigate("/prepbuild")}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition"
        >
          Yes! Let's Plan It
        </button>
      </div>
      </div>
    </div>
  );
}
