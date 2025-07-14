import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TripLiveDayBlock() {
  const tripId = localStorage.getItem("tripId");
  const dayIndex = Number(localStorage.getItem("dayIndex"));
  const blockName = localStorage.getItem("liveBlock"); // "morning", "afternoon", "evening"

  const [blockData, setBlockData] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [ask, setAsk] = useState("");
  const [answer, setAnswer] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const hydrate = async () => {
      try {
        const res = await axios.get(`/tripwell/itinerary/day/${tripId}/${dayIndex}`);
        const block = res.data?.blocks?.[blockName];
        setBlockData(block);
      } catch (err) {
        console.error("Hydration error:", err);
      }
    };
    hydrate();
  }, [tripId, dayIndex, blockName]);

  const handleSubmitFeedback = async () => {
    try {
      const res = await axios.post(`/tripwell/livedaygpt/block`, {
        tripId,
        dayIndex,
        block: blockName,
        feedback
      });
      setBlockData(res.data.updatedBlock);
    } catch (err) {
      console.error("GPT block feedback error:", err);
    }
  };

  const handleAskAngela = async () => {
    try {
      const res = await axios.post(`/tripwell/livedaygpt/ask`, {
        tripId,
        dayIndex,
        blockName,
        question: ask
      });
      setAnswer(res.data.answer);
    } catch (err) {
      console.error("Ask Angela error:", err);
    }
  };

  const handleMarkComplete = async () => {
    try {
      await axios.post(`/tripwell/markblockcomplete/${tripId}/${dayIndex}/${blockName}`);

      if (blockName === "evening") {
        await axios.post(`/tripwell/markdaycomplete/${tripId}/${dayIndex}`);

        // Canonical trip completion check
        const res = await axios.get(`/tripwell/livestatus/${tripId}`);
        if (res.data.tripComplete) {
          await axios.post(`/tripwell/marktripcomplete/${tripId}`);
          navigate("/tripcomplete");
        } else {
          navigate("/livedaycomplete");
        }
      } else {
        // Move to next block
        const order = ["morning", "afternoon", "evening"];
        const nextBlock = order[order.indexOf(blockName) + 1];
        if (nextBlock) {
          localStorage.setItem("liveBlock", nextBlock);
          navigate("/tripliveblock");
        }
      }
    } catch (err) {
      console.error("Mark complete error:", err);
      alert("Could not complete block.");
    }
  };

  if (!blockData) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Let’s make your {blockName} memorable!</h1>

      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="text-xl font-semibold">{blockData.title}</h2>
        <p className="text-gray-700 mt-2">{blockData.desc}</p>
      </div>

      {/* Feedback Section */}
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

      {/* Ask Angela Q&A */}
      <div>
        <h3 className="font-semibold">Ask Angela a question</h3>
        <input
          value={ask}
          onChange={(e) => setAsk(e.target.value)}
          className="w-full border p-2 rounded mt-2"
          placeholder="e.g., Is there a nearby rooftop for drinks?"
        />
        <button
          onClick={handleAskAngela}
          className="mt-2 bg-purple-600 text-white px-4 py-2 rounded-xl"
        >
          💬 Ask Angela
        </button>
        {answer && (
          <p className="mt-2 text-gray-800 italic bg-gray-50 p-2 rounded">{answer}</p>
        )}
      </div>

      {/* Final CTA */}
      <div className="pt-4 border-t">
        <button
          onClick={handleMarkComplete}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-lg"
        >
          ✅ Mark {blockName} Complete
        </button>
      </div>
    </div>
  );
}
