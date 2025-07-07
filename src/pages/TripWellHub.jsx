import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Compass,
  CalendarDays,
  PencilLine,
  Lightbulb,
  AlertTriangle,
  Home,
} from "lucide-react";

export default function TripWellHub() {
  const navigate = useNavigate();

  const tripId = localStorage.getItem("tripId");
  const role = localStorage.getItem("role") || "originator"; // default fallback
  const isParticipant = role === "participant";
  const noTrip = !tripId;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center">Let’s Build Your TripWell</h1>

      {noTrip ? (
        <div className="mt-4 p-4 border border-red-300 bg-red-50 rounded-xl text-sm text-red-800 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 mt-0.5" />
          <span>
            Looks like you haven’t created or joined a trip yet. You can return to the home page to start that process.
          </span>
        </div>
      ) : isParticipant ? (
        <div className="mt-4 p-4 border border-yellow-400 bg-yellow-50 rounded-xl text-sm text-yellow-800 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 mt-0.5" />
          <span>
            You’re a <strong>participant</strong> on this trip. You can’t plan the itinerary, but you’ll be able to follow along and journal once it’s active.  
            Check in with the person who invited you to see how planning is going.
          </span>
        </div>
      ) : (
        <p className="text-center text-gray-600">
          Welcome to your travel command center. You provide the intent and anchor points, and{" "}
          <strong>Angela</strong> (your AI co-planner) will generate a tailored itinerary. The steps
          below guide that process.
        </p>
      )}

      <div className="grid gap-4 mt-6">
        {!tripId && (
          <Button
            onClick={() => navigate("/tripwell/home")}
            className="w-full flex items-center justify-start px-4 py-3 text-lg rounded-xl shadow-md"
          >
            <Home className="w-5 h-5 mr-2" />
            Return to Home
          </Button>
        )}

        {tripId && (
          <>
            <Button
              onClick={() => navigate(`/tripwell/intent/${tripId}`)}
              disabled={isParticipant}
            >
              <Lightbulb className="w-5 h-5 mr-2" />
              Set My Trip Intent
            </Button>

            <Button
              onClick={() => navigate(`/tripwell/anchorselect/${tripId}`)}
              disabled={isParticipant}
            >
              <MapPin className="w-5 h-5 mr-2" />
              Select Anchor Points
            </Button>

            <Button
              onClick={() => navigate(`/tripwell/build/${tripId}`)}
              disabled={isParticipant}
            >
              <Compass className="w-5 h-5 mr-2" />
              Build My Itinerary
            </Button>

            <Button
              onClick={() => navigate(`/tripwell/itinerary/${tripId}`)}
            >
              <CalendarDays className="w-5 h-5 mr-2" />
              View My Itinerary
            </Button>

            <Button
              onClick={() => navigate(`/tripwell/modify/${tripId}`)}
              disabled={isParticipant}
            >
              <PencilLine className="w-5 h-5 mr-2" />
              Modify My Itinerary
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
