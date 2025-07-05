import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function TripItineraryMVP() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itineraryText, setItineraryText] = useState("");
  const [readyToGenerate, setReadyToGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    async function checkTripAndUser() {
      try {
        const whoami = await axios.get("/tripwell/whoami");
        const id = whoami.data.user?.tripId;
        const role = whoami.data.user?.role;
        setUserRole(role);

        // 🧼 Not logged in or no trip
        if (!id || id !== tripId) {
          navigate("/trip-setup");
          return;
        }

        if (role === "participant") {
          // 👥 Send to readonly or explainer
          navigate(`/tripwell/itinerary/participant/${tripId}`);
          return;
        }

        const anchors = await axios.get(`/tripwell/anchorselects/${id}`);
        if (!anchors?.data?.length) {
          navigate(`/tripwell/anchorselect/${id}`);
          return;
        }

        setReadyToGenerate(true);
      } catch (err) {
        console.error("Error during pre-check:", err);
        setError("Something went wrong checking your trip setup.");
      } finally {
        setLoading(false);
      }
    }

    checkTripAndUser();
  }, [navigate, tripId]);

  async function handleGenerate() {
    try {
      setGenerating(true);
      const res = await axios.get(`/tripwell/itinerarygpt/${tripId}`);
      setItineraryText(res.data);
    } catch (err) {
      console.error("GPT itinerary error:", err);
      setError("Could not generate itinerary.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      await axios.post(`/tripwell/itinerary/${tripId}`, { itinerary: itineraryText });
      navigate(`/tripwell/itinerary/final/${tripId}`);
    } catch (err) {
      console.error("Save error:", err);
      setError("Could not save itinerary.");
    } finally {
      setSaving(false);
    }
  }

  function handleModify() {
    navigate(`/tripwell/daymodifier/${tripId}`);
  }

  if (loading) return <div className="p-4 text-center animate-pulse">Checking your role and setup…</div>;
  if (error) return <div className="p-4 text-red-500 text-center">{error}</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 text-center">
      <h1 className="text-3xl font-bold text-green-600">Your Trip Itinerary</h1>

      {!itineraryText && readyToGenerate && (
        <div className="mt-6">
          <button
            onClick={handleGenerate}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl shadow"
            disabled={generating}
          >
            {generating ? "Generating..." : "🧠 Generate My Itinerary"}
          </button>
        </div>
      )}

      {itineraryText && (
        <>
          <pre className="whitespace-pre-wrap text-left text-gray-800 bg-white rounded-xl shadow p-4">
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
        </>
      )}
    </div>
  );
}