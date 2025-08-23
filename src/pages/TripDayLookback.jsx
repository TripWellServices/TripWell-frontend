import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
  const [moodTag, setMoodTag] = useState("");
  const [journalText, setJournalText] = useState("");
  const navigate = useNavigate();

  const moodOptions = [
    "😄 Full of Memories", "😩 Exhausted", "😌 Exhausted in a Good Way",
    "🍕 Ate Too Much", "😋 Ate Too Much in a Good Way", "🧘 Reflective",
    "🤯 Mind Blown", "💤 Chill Day", "🎢 Rollercoaster"
  ];

  useEffect(() => {
    // Load trip data from localStorage
    const tripData = JSON.parse(localStorage.getItem("tripData") || "null");
    const itineraryData = JSON.parse(localStorage.getItem("itineraryData") || "null");
    
    if (!tripData?.tripId || !itineraryData?.days) {
      console.error("❌ Missing trip data or itinerary data");
      navigate("/");
      return;
    }

    // Get current state
    const { currentDayIndex } = getCurrentState();
    
    // Find the current day data
    const currentDayData = itineraryData.days.find(day => day.dayIndex === currentDayIndex);
    
    if (!currentDayData) {
      console.error("❌ Current day not found in itinerary");
      navigate("/");
      return;
    }

    // Check if this is the last day
    const isLastDay = currentDayIndex >= itineraryData.days.length;

    // Set trip data
    setTripData({
      ...tripData,
      currentDay: currentDayIndex,
      totalDays: itineraryData.days.length,
      dayData: currentDayData,
      isLastDay
    });
    
    setLoading(false);
    console.log("✅ TripDayLookback loaded - Day", currentDayIndex);
  }, [navigate]);

  const handleSave = async () => {
    if (!tripData) return;
    
    setSaving(true);
    
    try {
      // Save reflection to localStorage
      const existing = JSON.parse(localStorage.getItem("reflectionData") || "[]");
      const newReflection = {
        dayIndex: tripData.currentDay,
        moodTag,
        journalText,
        summary: tripData.dayData?.summary || `Day ${tripData.currentDay} reflection`,
        timestamp: new Date().toISOString()
      };
      
      existing.push(newReflection);
      localStorage.setItem("reflectionData", JSON.stringify(existing));
      
      console.log("✅ Reflection saved for Day", tripData.currentDay);

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
            <h3 className="text-lg font-semibold text-gray-700 mb-4">What vibe captures today?</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {moodOptions.map((mood) => (
                <label
                  key={mood}
                  className={`border-2 rounded-xl px-4 py-3 text-center cursor-pointer transition-all ${
                    moodTag === mood 
                      ? "bg-green-100 border-green-600 font-semibold" 
                      : "bg-gray-50 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="mood"
                    value={mood}
                    checked={moodTag === mood}
                    onChange={() => setMoodTag(mood)}
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
              disabled={saving || !moodTag}
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
