import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import BACKEND_URL from "../config";

export default function TripItineraryBuilder() {
  const navigate = useNavigate();
  const [itineraryText, setItineraryText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Get data from localStorage
  const userData = JSON.parse(localStorage.getItem("userData") || "null");
  const tripData = JSON.parse(localStorage.getItem("tripData") || "null");
  const tripIntentData = JSON.parse(localStorage.getItem("tripIntentData") || "null");
  const anchorSelectData = JSON.parse(localStorage.getItem("anchorSelectData") || "null");

  useEffect(() => {
    async function buildItinerary() {
      try {
        const token = await auth.currentUser.getIdToken();

        // Step 1: Build itinerary via Angela (GPT)
        const res = await fetch(`${BACKEND_URL}/tripwell/itinerary/build`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ tripId: tripData.tripId }),
        });
        
        if (!res.ok) {
          throw new Error(`Build failed: ${res.status}`);
        }
        
        const buildData = await res.json();
        const { daysSaved } = buildData;

        // Step 2: Summarize it for display
        const savedDaysRes = await fetch(`${BACKEND_URL}/tripwell/itinerary/days/${tripData.tripId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (savedDaysRes.ok) {
          const savedDays = await savedDaysRes.json();
          const combinedSummary = savedDays
            .map((day) => `Day ${day.dayIndex}: ${day.summary}`)
            .join("\n");

          setItineraryText(combinedSummary || "Angela generated your itinerary.");
        } else {
          setItineraryText("Angela generated your itinerary.");
        }
      } catch (err) {
        console.error("Itinerary generation error:", err);
        setError("Something went wrong while building your itinerary.");
      } finally {
        setLoading(false);
      }
    }

    buildItinerary();
  }, [tripData.tripId]);

  async function handleSave() {
    try {
      setSaving(true);
      
      // Save to localStorage for test flow
      const itineraryData = {
        itineraryId: "generated-itinerary-id",
        days: itineraryText.split('\n').filter(day => day.trim()).map((day, index) => ({
          dayIndex: index + 1,
          summary: day
        }))
      };
      localStorage.setItem("itineraryData", JSON.stringify(itineraryData));
      console.log("💾 Saved itineraryData to localStorage:", itineraryData);
      
      navigate("/prephub");
    } catch (err) {
      console.error("Save error:", err);
      setError("Could not save itinerary.");
    } finally {
      setSaving(false);
    }
  }

  function handleModify() {
    navigate("/tripwell/itinerary/modify");
  }

  // If no localStorage data, show error
  if (!userData || !tripData || !tripIntentData || !anchorSelectData) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Missing Data</h1>
          <p className="text-gray-600">Please start from the beginning.</p>
          <button 
            onClick={() => navigate("/")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-4 text-center">Building your itinerary with Angela...</div>;
  if (error) return <div className="p-4 text-red-500 text-center">{error}</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Your Trip Itinerary</h1>

      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <p className="text-sm text-blue-800">
          Planning: <strong>{tripData.tripName}</strong> to <strong>{tripData.city}</strong>
        </p>
      </div>

      <pre className="whitespace-pre-wrap text-gray-800 bg-white rounded-xl shadow p-4">
        {itineraryText}
      </pre>

      <div className="flex gap-4 justify-center mt-6">
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-6 py-2 rounded-2xl shadow hover:bg-green-700"
          disabled={saving}
        >
          {saving ? "Saving..." : "✅ This looks great – Save it"}
        </button>

        <button
          onClick={handleModify}
          className="bg-yellow-500 text-white px-6 py-2 rounded-2xl shadow hover:bg-yellow-600"
        >
          🛠 I want to modify
        </button>
      </div>
    </div>
  );
}
