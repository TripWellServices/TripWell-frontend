import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

import { useState } from "react";
import axios from "axios";

export default function TripWellHub({ tripId, tripData = {}, userData = {} }) {
  const [userText, setUserText] = useState("");
  const [gptReply, setGptReply] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!userText.trim()) return;
    setLoading(true);

    try {
      const endpoint = tripId ? `/trip/${tripId}/chat` : `/plan/ai`;
      const payload = tripId
        ? { userInput: userText, tripData, userData }
        : { userInput: userText, userData };

      const res = await axios.post(endpoint, payload);
      setGptReply(res.data.reply);
    } catch (err) {
      console.error("Failed to get GPT response", err);
    }

    setLoading(false);
  };

  const formatDates = (dates) => {
    if (!dates || dates.length < 2) return "";
    return `${dates[0]} to ${dates[1]}`;
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">🧠 TripWell Assistant</h2>

      {tripData?.destination ? (
        <div className="text-gray-700 mb-6">
          <p>
            We already know you're heading to{" "}
            <strong>{tripData.destination}</strong> from{" "}
            <strong>{formatDates(tripData.dates)}</strong>.
          </p>
          <p className="mt-3">
            Just drop a few breadcrumbs — things that might already be booked, or things you're hoping to do:
          </p>
          <ul className="list-disc list-inside mt-2 mb-4">
            <li>Hotel you’re staying at?</li>
            <li>Food or experiences you want to try?</li>
            <li>The vibe you’re trying to soak in?</li>
          </ul>
          <p className="italic text-gray-600">
            Example: “We get in early on the 5th, staying at a place called Rom de La Pen. I just want a peaceful trip — maybe a good walk, some espresso spots, and something fun for my kid.”
          </p>
        </div>
      ) : (
        <div className="text-gray-700 mb-6">
          <p className="mb-3">
            Dreaming of your next escape? Just tell us a little bit — mood, destination idea, timeframe —
            and we’ll spark something up.
          </p>
          <p className="italic text-gray-600">
            Example: “Somewhere warm in mid-July. Traveling solo. I want food, nature, and time to think.”
          </p>
        </div>
      )}

      <textarea
        className="w-full h-40 border rounded p-4 mb-4"
        placeholder="Drop your trip notes, ideas, or thoughts here..."
        value={userText}
        onChange={(e) => setUserText(e.target.value)}
      />

      <button
        onClick={handleSend}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Thinking..." : "Send to TripWell AI"}
      </button>

      {gptReply && (
        <div className="mt-6 bg-gray-50 border-l-4 border-blue-500 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">TripWell AI Says:</h3>
          <p className="text-gray-800 whitespace-pre-line">{gptReply}</p>
        </div>
      )}
    </div>
  );
}

  const firstName = user.name.split(" ")[0];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-2">Hi {firstName},</h2>
      <p className="text-gray-700 mb-6">
        Welcome to your TripWell hub. Let’s plan something epic.
      </p>

      {/* TAB NAVIGATION */}
      <div className="flex space-x-4 border-b mb-6">
        {["Trip", "AI"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 border-b-2 ${
              activeTab === tab
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-gray-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {activeTab === "Trip" && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Your Trip</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
            ullamcorper, nisl eget vehicula feugiat, nunc arcu aliquet quam, a
            commodo velit justo id neque.
          </p>
        </div>
      )}

      {activeTab === "AI" && (
        <div>
          <h3 className="text-xl font-semibold mb-2">AI Planner</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer ut
            blandit sapien. Morbi sit amet orci luctus, sollicitudin mi nec,
            luctus lacus.
          </p>
        </div>
      )}
    </div>
  );
}
