import { useState } from "react";
import axios from "axios";

export default function TripPlannerAI({ tripId, tripData = {}, userData = {} }) {
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

  const getPrimaryCity = () => {
    return tripData?.destinations?.[0]?.city || "your destination";
  };

  const getDateRange = () => {
    const start = tripData?.destinations?.[0]?.startDate;
    const end = tripData?.destinations?.[0]?.endDate;
    if (start && end) {
      return `${start.slice(0, 10)} to ${end.slice(0, 10)}`;
    }
    return "your dates";
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">🧠 TripWell Assistant</h2>

      <div className="text-gray-700 mb-6">
        <p>
          We already know you're heading to{" "}
          <strong>{getPrimaryCity()}</strong> from{" "}
          <strong>{getDateRange()}</strong>.
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
          Example: “We get in early on the 5th, staying at a p
