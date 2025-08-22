import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import axios from "axios";

export default function TripLiveBlock() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tripId, currentDay, currentBlock, totalDays } = location.state || {};

  const [blockData, setBlockData] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [ask, setAsk] = useState("");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    const hydrateBlock = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await axios.get(`/tripwell/itinerary/day/${tripId}/${currentDay}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBlockData(res.data?.blocks?.[currentBlock]);
      } catch (err) {
        console.error("Hydrate block error:", err);
        navigate("/access");
      }
    };

    hydrateBlock();
  }, [tripId, currentDay, currentBlock, navigate]);

  const handleSubmitFeedback = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.post(`/tripwell/livedaygpt/block`, {
        tripId,
        dayIndex: currentDay,
        block: currentBlock,
        feedback,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlockData(res.data.updatedBlock);
    } catch (err) {
      console.error("Feedback error:", err);
    }
  };

  const handleAskAngela = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.post(`/tripwell/livedaygpt/ask`, {
        tripId,
        dayIndex: currentDay,
        blockName: currentBlock,
        question: ask,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnswer(res.data.answer);
    } catch (err) {
      console.error("Ask error:", err);
    }
  };

  const handleMarkComplete = () => {
    let nextBlock = "morning";
    let nextDay = currentDay;

    if (currentBlock === "morning") nextBlock = "afternoon";
    if (currentBlock === "afternoon") nextBlock = "evening";
    if (currentBlock === "evening") {
      // if final day → reflection / complete
      if (currentDay === totalDays) {
        navigate("/tripdaylookback", { state: { tripId, dayIndex: currentDay, tripComplete: true } });
        return;
      }
      // otherwise → lookback for day
      navigate("/tripdaylookback", { state: { tripId, dayIndex: currentDay, tripComplete: false } });
      return;
    }

    // move to next block
    navigate("/tripliveblock", { state: { tripId, currentDay: nextDay, currentBlock: nextBlock, totalDays } });
  };

  if (!blockData) return <div className="p-6">Loading block...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Let’s make your {currentBlock} memorable!</h1>

      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="text-xl font-semibold">{blockData.title}</h2>
        <p className="text-gray-700 mt-2">{blockData.desc}</p>
      </div>

      {/* Feedback */}
      <div>
        <h3 className="font-semibold">Want to change something?</h3>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full border p-2 rounded mt-2"
          placeholder="Tell Angela what to improve..."
        />
        <button
          onClick={handleSubmitFeedback}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-xl"
        >
          🔁 Fix the Itinerary
        </button>
      </div>

      {/* Ask */}
      <div>
        <h3 className="font-semibold">Ask Angela a question</h3>
        <input
          value={ask}
          onChange={(e) => setAsk(e.target.value)}
          className="w-full border p-2 rounded mt-2"
          placeholder="e.g., Is there a rooftop bar nearby?"
        />
        <button
          onClick={handleAskAngela}
          className="mt-2 bg-purple-600 text-white px-4 py-2 rounded-xl"
        >
          💬 Ask Angela
        </button>
        {answer && <p className="mt-2 italic bg-gray-50 p-2 rounded">{answer}</p>}
      </div>

      {/* CTA */}
      <div className="pt-4 border-t">
        <button
          onClick={handleMarkComplete}
          className="w-full bg-green-600 text-white py-3 rounded-xl text-lg"
        >
          ✅ Mark {currentBlock} Complete
        </button>
      </div>
    </div>
  );
}
