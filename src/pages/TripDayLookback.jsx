import { useState, useEffect } from "react";
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

export default function TripDayLookback() {
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [moodTags, setMoodTags] = useState([]);
  const [journalText, setJournalText] = useState("");
  const navigate = useNavigate();

  const moodOptions = [
    "😄 Full of Memories", "😩 Exhausted", "😌 Exhausted in a Good Way",
    "🍕 Ate Too Much", "😋 Ate Too Much in a Good Way", "🧘 Reflective",
    "🤯 Mind Blown", "💤 Chill Day", "🎢 Rollercoaster"
  ];

  useEffect(() => {
    // 🔴 SUPER SIMPLE HYDRATION: Just get the day that was completed
    const tripData = JSON.parse(localStorage.getItem("tripData") || "null");
    const { currentDayIndex } = getCurrentState();
    const completedDayIndex = currentDayIndex - 1; // The day that was just finished
    
    console.log("🔍 TripDayLookback - Day", completedDayIndex, "completed, moving to Day", currentDayIndex);
    
    if (!tripData?.tripId) {
      console.error("❌ Missing trip data");
      setError("No trip data found. Please return to your trip.");
      setLoading(false);
      return;
    }

    // Check if this is the last day
    const isLastDay = currentDayIndex > tripData.daysTotal;

    // Set trip data
    setTripData({
      ...tripData,
      currentDay: completedDayIndex,
      isLastDay
    });
    
    setLoading(false);
    console.log("✅ TripDayLookback loaded - Day", completedDayIndex);
  }, [navigate]);

  const handleSave = async () => {
    if (!tripData) return;
    
    setSaving(true);
    
    try {
      // 🔴 SAVE TO BACKEND: Save reflection
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
                          await axios.post(`${BACKEND_URL}/tripwell/reflection/${tripData.tripId}/${tripData.currentDay}`, {
          summary: `Day ${tripData.currentDay} reflection`,
          moodTags,
          journalText
        }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("✅ Reflection saved to backend for Day", tripData.currentDay);

      // Navigate based on whether this is the last day
      if (tripData.isLastDay) {
        navigate("/tripcomplete");
      } else {
        // Move to next day, morning
        setCurrentState(tripData.currentDay + 1, "morning");
        navigate("/tripliveday");
      }
    } catch (error) {
      console.error("❌ Error saving reflection:", error);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-xl font-semibold text-gray-700">Loading your reflection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-3xl shadow-2xl text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">⚠️ Unable to Load Reflection</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
            >
              🔄 Try Again
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200"
            >
              🏠 Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-700 mb-2">
            🎉 You finished Day {tripData.currentDay}!
          </h1>
          <p className="text-xl text-gray-600">
            {tripData.tripName} • {tripData.city}
          </p>
        </div>

        {/* Reflection Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">How was your day?</h2>
          
          {/* Mood Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">What vibes capture today? (Select multiple)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {moodOptions.map((mood) => (
                <label
                  key={mood}
                  className={`border-2 rounded-xl px-4 py-3 text-center cursor-pointer transition-all ${
                    moodTags.includes(mood)
                      ? "bg-green-100 border-green-600 font-semibold" 
                      : "bg-gray-50 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    value={mood}
                    checked={moodTags.includes(mood)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setMoodTags([...moodTags, mood]);
                      } else {
                        setMoodTags(moodTags.filter(tag => tag !== mood));
                      }
                    }}
                    className="hidden"
                  />
                  {mood}
                </label>
              ))}
            </div>
          </div>

          {/* Journal Entry */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Write down your thoughts...</h3>
            <textarea
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder="What was the highlight of your day? Any funny moments? How did you feel?"
              className="w-full border-2 border-gray-200 rounded-xl p-4 text-lg focus:border-blue-500 focus:outline-none resize-none"
              rows={6}
            />
          </div>

          {/* Save Button */}
          <div className="text-center">
            <button
              onClick={handleSave}
              disabled={saving || moodTags.length === 0}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-12 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 font-semibold text-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving...
                </span>
              ) : (
                "✅ Save Reflection"
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center">
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
