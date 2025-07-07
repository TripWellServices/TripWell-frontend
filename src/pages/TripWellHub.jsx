import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Compass,
  CalendarDays,
  PencilLine,
  UserCircle,
  AlertTriangle,
} from "lucide-react";

export default function TripWellHub() {
  const [loading, setLoading] = useState(true);
  const [whoami, setWhoami] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadWhoami() {
      try {
        const res = await axios.get("/tripwell/whoami");
        setWhoami(res.data);
      } catch (err) {
        console.error("Failed to load session info:", err);
      } finally {
        setLoading(false);
      }
    }

    loadWhoami();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center p-6">
        <p className="text-lg text-gray-500">Loading your TripWell experience...</p>
      </div>
    );
  }

  if (!whoami) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center p-6">
        <p className="text-red-600 font-semibold">
          Could not verify your TripWell session. Please refresh or re-login.
        </p>
      </div>
    );
  }

  const { role, tripId, tripStarted, hasItinerary } = whoami;

  const isParticipant = role === "participant";

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center">Let’s Build Your TripWell Experience</h1>

      <p className="text-center text-gray-600">
        Ok traveler, now the fun begins. You’ve got your dates and your destination.
        <br />
        Now it’s time to lock in your anchors, build an itinerary, and fine-tune it with Angela.
      </p>

      {isParticipant && (
        <div className="mt-4 p-4 border border-yellow-400 bg-yellow-50 rounded-xl text-sm text-yellow-800">
          You're a <strong>participant</strong> on this trip. You won’t be able to build the
          itinerary yourself — but once it’s ready, you’ll be able to follow along and journal.
          <br />
          In the meantime, contact your trip originator for next steps.
        </div>
      )}

      <div className="grid gap-4 mt-6">
        <Button
          onClick={() => navigate(`/tripwell/anchorselect/${tripId}`)}
          disabled={isParticipant}
          className="w-full flex items-center justify-start px-4 py-3 text-lg rounded-xl shadow-md"
        >
          <MapPin className="w-5 h-5 mr-2" />
          Pick My Anchors
        </Button>

        <Button
          onClick={() => navigate(`/tripwell/itinerary/${tripId}`)}
          disabled={isParticipant}
          className="w-full flex items-center justify-start px-4 py-3 text-lg rounded-xl shadow-md"
        >
          <Compass className="w-5 h-5 mr-2" />
          View My Itinerary
        </Button>

        <Button
          onClick={() => navigate(`/tripwell/modify/${tripId}`)}
          disabled={isParticipant || !hasItinerary}
          className="w-full flex items-center justify-start px-4 py-3 text-lg rounded-xl shadow-md"
        >
          <PencilLine className="w-5 h-5 mr-2" />
          Modify My Itinerary
        </Button>

        <Button
          onClick={() => navigate(`/tripwell/profile`)}
          className="w-full flex items-center justify-start px-4 py-3 text-lg rounded-xl shadow-md"
        >
          <UserCircle className="w-5 h-5 mr-2" />
          Edit My Profile
        </Button>

        {tripStarted ? (
          <Button
            onClick={() => navigate(`/tripwell/prelive`)}
            className="w-full flex items-center justify-start px-4 py-3 text-lg rounded-xl shadow-md"
          >
            <CalendarDays className="w-5 h-5 mr-2" />
            Continue My Trip
          </Button>
        ) : (
          <Button
            onClick={() => navigate(`/tripwell/starttrip/${tripId}`)}
            disabled={isParticipant}
            className="w-full flex items-center justify-start px-4 py-3 text-lg rounded-xl shadow-md"
          >
            <CalendarDays className="w-5 h-5 mr-2" />
            Start My Trip
          </Button>
        )}
      </div>
    </div>
  );
}
