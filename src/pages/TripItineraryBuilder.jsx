import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TripItineraryBuild() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    async function buildItinerary() {
      try {
        // Step 1: Get user and trip context
        const whoRes = await axios.get("/tripwell/whoami");
        const { userId } = whoRes.data;

        const statusRes = await axios.get("/tripwell/tripstatus");
        const { tripId, anchorsExist } = statusRes.data;

        if (!tripId || !anchorsExist) {
          setStatusMsg("Missing trip or anchors. Returning home.");
          setTimeout(() => navigate("/tripwell/home"), 2500);
          return;
        }

        // Step 2: Check if TripDays already exist
        const daysRes = await axios.get(`/tripwell/itinerary/days/${tripId}`);
        if (daysRes.data && daysRes.data.length > 0) {
          navigate("/tripwell/itinerary/update");
          return;
        }

        // Step 3: Generate and save new itinerary
        setStatusMsg("Generating itinerary...");
        const genRes = await axios.post(`/tripwell/itinerary/${tripId}`, { userId });

        if (genRes.status === 200) {
          navigate("/tripwell/itinerary/update");
        } else {
          setStatusMsg("Itinerary generation failed.");
        }
      } catch (err) {
        console.error("Itinerary build error:", err);
        setStatusMsg("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    buildItinerary();
  }, [navigate]);

  return (
    <div className="p-4 text-center">
      <h2 className="text-xl font-semibold mb-2">Building Your Itinerary...</h2>
      <p>{statusMsg || "One moment while we generate your personalized trip."}</p>
    </div>
  );
}
