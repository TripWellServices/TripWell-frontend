import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { BACKEND_URL } from "../config";
import { fetchJSON } from "../utils/fetchJSON";

export default function TripCreated() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function hydrateTrip() {
      try {
        // Get Firebase token for auth
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
          console.error("❌ No Firebase user");
          navigate("/access");
          return;
        }

        const token = await firebaseUser.getIdToken();
        
        // First get user data from /whoami
        const userData = await fetchJSON(`${BACKEND_URL}/tripwell/whoami`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store"
        });

        if (!userData?.user) {
          console.error("❌ No user found");
          navigate("/access");
          return;
        }

        setUser(userData.user);

        // Use tripId from user object (NO URL PARAMS!)
        if (!userData.user.tripId) {
          console.error("❌ No tripId in user object");
          navigate("/");
          return;
        }

        // Call tripcreated route with tripId from user object
        const tripData = await fetchJSON(`${BACKEND_URL}/tripwell/tripcreated/${userData.user.tripId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store"
        });

        if (!tripData?.trip) {
          throw new Error("No trip returned");
        }

        setTrip(tripData.trip);
      } catch (err) {
        console.error("❌ Trip hydration failed:", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    }

    hydrateTrip();
  }, [navigate]);

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading your trip...</div>;
  }

  if (!trip) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        🚫 Could not load trip.
      </div>
    );
  }

  const shareMessage = `Hey! Join me on TripWell to plan our ${trip.city} trip.\n\nTrip code: ${trip.joinCode || trip.tripId}\nDownload: https://tripwell.app/download`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareMessage);
    alert("Message copied to clipboard!");
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center text-green-700">
        🎉 Your Trip Is Ready
      </h1>

      <div className="bg-white shadow rounded-lg p-4 space-y-2 border text-sm">
        <p><strong>Trip Name:</strong> {trip.tripName}</p>
        <p><strong>Purpose:</strong> {trip.purpose || "—"}</p>
        <p><strong>Destination:</strong> {trip.city}</p>
        <p><strong>Dates:</strong> {new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}</p>
        <p><strong>Party Count:</strong> {trip.partyCount}</p>
        <p><strong>With:</strong> {(trip.whoWith || []).join(", ") || "—"}</p>
        <p><strong>Trip Code:</strong> <span className="font-mono text-blue-600">{trip.joinCode || trip.tripId}</span></p>
      </div>

      <div className="space-y-4 text-gray-700">
        <h2 className="text-xl font-semibold">Invite Others</h2>
        <textarea
          value={shareMessage}
          readOnly
          className="w-full border rounded p-2 bg-gray-50 font-mono text-sm"
          rows={4}
        />
        <button
          onClick={handleCopy}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          📋 Copy Invite Message
        </button>
      </div>

      <div className="space-y-4 text-center">
        <p className="text-lg font-semibold text-gray-800">
          Ready to plan the rest of your trip?
        </p>
        <button
          onClick={() => navigate("/prepbuild")}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition"
        >
          Yes! Let's Plan It
        </button>
        <button
          onClick={() => navigate("/")}
          className="w-full bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
        >
          🏠 Head Home
        </button>
      </div>
    </div>
  );
}
