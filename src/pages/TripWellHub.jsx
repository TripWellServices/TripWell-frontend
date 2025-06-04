import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import TripPlannerAI from "./TripPlannerAI";

export default function TripWellHub() {
  const location = useLocation();
  const userData = location.state?.userData;
  const [tripData, setTripData] = useState(null);
  const [activeSection, setActiveSection] = useState("trip");

  useEffect(() => {
    const fetchTrip = async () => {
      if (!userData?.tripId) return;

      try {
        const tripRes = await fetch(`https://gofastbackend.onrender.com/api/trips/${userData.tripId}`);
        const trip = await tripRes.json();
        setTripData(trip);
      } catch (err) {
        console.error("🔥 Failed to load trip", err);
      }
    };

    fetchTrip();
  }, [userData]);

  if (!userData) {
    return <div className="p-6 text-center text-red-500">No user loaded</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold">
        Hi {userData.preferredName || userData.name},
      </h2>
      <p className="text-gray-700">
        Please see your trip outlook and get your bags packed for a great adventure.
      </p>

      <div className="flex space-x-4 mt-4">
        <button
          className={`px-4 py-2 rounded ${
            activeSection === "trip" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveSection("trip")}
        >
          View Trip
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeSection === "ai" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveSection("ai")}
        >
          Open AI Planner
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeSection === "profile" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveSection("profile")}
        >
          Edit Profile
        </button>
      </div>

      {activeSection === "trip" && tripData && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Your Trip</h3>
          <p><strong>Trip Name:</strong> {tripData.tripName}</p>
          <p><strong>Purpose:</strong> {tripData.purpose}</p>
          <p>
            <strong>Dates:</strong>{" "}
            {new Date(tripData.startDate).toLocaleDateString()} to{" "}
            {new Date(tripData.endDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Destination:</strong>{" "}
            {tripData.destinations?.[0] || "Not yet added"}
          </p>
        </div>
      )}

      {activeSection === "ai" && (
        <div className="pt-4">
          <TripPlannerAI />
        </div>
      )}

      {activeSection === "profile" && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Your Profile</h3>
          <p><strong>Name:</strong> {userData.name}</p>
          <p><strong>Email:</strong> {userData.email}</p>
        </div>
      )}
    </div>
  );
}
