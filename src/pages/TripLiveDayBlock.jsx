import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../firebase";
import BACKEND_URL from "../config";

// Simple state management
const getCurrentState = () => {
  return {
    currentDayIndex: parseInt(localStorage.getItem("currentDayIndex") || "1"),
    currentBlockName: localStorage.getItem("currentBlockName") || "morning"
  };
};

const setCurrentState = (dayIndex, blockName) => {
  localStorage.setItem("currentDayIndex", dayIndex.toString());
  localStorage.setItem("currentBlockName", blockName);
};

export default function TripLiveDayBlock() {
  const navigate = useNavigate();
  const [tripData, setTripData] = useState(null);
  const [blockData, setBlockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [ask, setAsk] = useState("");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    const hydrateBlock = async () => {
      try {
        // 🔴 HYDRATE: Get current state and trip data
        const { currentDayIndex, currentBlockName } = getCurrentState();
        const tripData = JSON.parse(localStorage.getItem("tripData") || "null");
        const itineraryData = JSON.parse(localStorage.getItem("itineraryData") || "null");
        
        console.log("🔍 TripLiveDayBlock - currentDayIndex:", currentDayIndex);
        console.log("🔍 TripLiveDayBlock - currentBlockName:", currentBlockName);
        
        if (!tripData?.tripId || !itineraryData?.days) {
          console.error("❌ Missing trip or itinerary data");
          navigate("/");
          return;
        }

        // Find the current day data
        const currentDayData = itineraryData.days.find(day => day.dayIndex === currentDayIndex);
        
        if (!currentDayData) {
          console.error("❌ Current day not found in itinerary");
          navigate("/");
          return;
        }

        // Get the current block data
        const block = currentDayData.blocks?.[currentBlockName];
        
        if (!block) {
          console.error("❌ Current block not found");
          navigate("/");
          return;
        }

        setTripData(tripData);
        setBlockData(block);
        setLoading(false);
        
        console.log("✅ TripLiveDayBlock loaded - Day", currentDayIndex, currentBlockName);
      } catch (error) {
        console.error("❌ TripLiveDayBlock hydration error:", error);
        navigate("/");
      }
    };

    hydrateBlock();
  }, [navigate]);

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) return;
    
    try {
      // Wait for Firebase auth to be ready
      await new Promise(resolve => {
        const unsubscribe = auth.onAuthStateChanged(user => {
          unsubscribe();
          resolve(user);
        });
      });

      const user = auth.currentUser;
      if (!user) {
        throw new Error("No authenticated user");
      }
      
      const token = await user.getIdToken();
      
      const res = await axios.post(`${BACKEND_URL}/tripwell/livedaygpt/block`, {
        tripId: tripData.tripId,
        dayIndex: getCurrentState().currentDayIndex,
        block: getCurrentState().currentBlockName,
        feedback,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setBlockData(res.data.updatedBlock);
      setFeedback("");
      console.log("✅ Block updated with feedback");
    } catch (err) {
      console.error("❌ GPT feedback error:", err);
    }
  };

  const handleAskAngela = async () => {
    if (!ask.trim()) return;
    
    try {
      // Wait for Firebase auth to be ready
      await new Promise(resolve => {
        const unsubscribe = auth.onAuthStateChanged(user => {
          unsubscribe();
          resolve(user);
        });
      });

      const user = auth.currentUser;
      if (!user) {
        throw new Error("No authenticated user");
      }
      
      const token = await user.getIdToken();
      
      const res = await axios.post(`${BACKEND_URL}/tripwell/livedaygpt/ask`, {
        tripId: tripData.tripId,
        dayIndex: getCurrentState().currentDayIndex,
        blockName: getCurrentState().currentBlockName,
        question: ask,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAnswer(res.data.answer);
      setAsk("");
      console.log("✅ Angela answered question");
    } catch (err) {
      console.error("❌ Ask Angela error:", err);
    }
  };

  const handleMarkComplete = async () => {
    if (!tripData || !blockData) return;
    
    setCompleting(true);
    
    try {
      // Wait for Firebase auth to be ready
      await new Promise(resolve => {
        const unsubscribe = auth.onAuthStateChanged(user => {
          unsubscribe();
          resolve(user);
        });
      });

      const user = auth.currentUser;
      if (!user) {
        throw new Error("No authenticated user");
      }
      
      const token = await user.getIdToken();
      const { currentDayIndex, currentBlockName } = getCurrentState();
      
      // 🔴 SAVE TO BACKEND: Mark block complete
      await axios.post(`${BACKEND_URL}/tripwell/block/complete`, {
        tripId: tripData.tripId,
        dayIndex: currentDayIndex,
        blockName: currentBlockName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("✅ Block completed on backend:", currentBlockName);
      
      // 🔴 ADVANCE: Move to next block or day
      const advanceBlock = () => {
        const { currentDayIndex, currentBlockName } = getCurrentState();
        const itineraryData = JSON.parse(localStorage.getItem("itineraryData") || "null");
        const currentDayData = itineraryData.days.find(day => day.dayIndex === currentDayIndex);
        
        let nextDayIndex = currentDayIndex;
        let nextBlockName = "morning";
        
        if (currentBlockName === "morning") {
          nextBlockName = "afternoon";
        } else if (currentBlockName === "afternoon") {
          nextBlockName = "evening";
        } else if (currentBlockName === "evening") {
          // Move to next day
          nextDayIndex = currentDayIndex + 1;
          nextBlockName = "morning";
        }
        
        console.log("✅ Advanced to:", nextBlockName, "Day", nextDayIndex);
        setCurrentState(nextDayIndex, nextBlockName);
        
        // Check if we've completed all days
        if (nextDayIndex > itineraryData.days.length) {
          console.log("✅ Trip complete!");
          navigate("/tripcomplete");
          return;
        }
        
        // Check if next block exists
        const nextDayData = itineraryData.days.find(day => day.dayIndex === nextDayIndex);
        if (!nextDayData?.blocks?.[nextBlockName]) {
          console.log("✅ No more blocks, trip complete!");
          navigate("/tripcomplete");
          return;
        }
        
        // Navigate to next block or day lookback
        if (nextBlockName === "morning" && nextDayIndex > currentDayIndex) {
          // New day - go to day lookback first
          navigate("/daylookback");
        } else {
          // Same day, next block
          navigate("/tripliveblock");
        }
      };
      
      advanceBlock();
      
    } catch (error) {
      console.error("❌ Error completing block:", error);
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-xl font-semibold text-gray-700">Loading your block...</p>
        </div>
      </div>
    );
  }

  if (!blockData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl font-semibold text-red-600">Block not found</p>
          <button
            onClick={() => navigate("/tripliveday")}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl"
          >
            Back to Day Overview
          </button>
        </div>
      </div>
    );
  }

  const { currentBlockName } = getCurrentState();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Let's make your {currentBlockName} memorable!
          </h1>
          <p className="text-xl text-gray-600">
            {tripData.tripName} • Day {getCurrentState().currentDayIndex}
          </p>
        </div>

        {/* Current Block Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">{blockData.title}</h2>
          {blockData.description && (
            <p className="text-gray-700 text-lg leading-relaxed">{blockData.description}</p>
          )}
        </div>

        {/* Feedback / GPT block fix */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Want to change something?</h3>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl p-4 text-lg focus:border-blue-500 focus:outline-none resize-none"
            placeholder="Tell Angela what to improve about this activity..."
            rows={3}
          />
          <button
            onClick={handleSubmitFeedback}
            disabled={!feedback.trim()}
            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔁 Fix the Itinerary
          </button>
        </div>

        {/* Ask Angela Q&A */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Ask Angela a question</h3>
          <input
            value={ask}
            onChange={(e) => setAsk(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl p-4 text-lg focus:border-purple-500 focus:outline-none"
            placeholder="e.g., Is there a nearby rooftop for drinks? What's the best time to visit?"
          />
          <button
            onClick={handleAskAngela}
            disabled={!ask.trim()}
            className="mt-4 bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            💬 Ask Angela
          </button>
          {answer && (
            <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <p className="text-gray-800 italic">{answer}</p>
            </div>
          )}
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <button
            onClick={handleMarkComplete}
            disabled={completing}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-12 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 font-semibold text-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {completing ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Completing...
              </span>
            ) : (
              `✅ Mark ${currentBlockName} Complete`
            )}
          </button>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/tripliveday")}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Day Overview
          </button>
        </div>
      </div>
    </div>
  );
}
