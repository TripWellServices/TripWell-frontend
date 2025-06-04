import { useEffect, useState } from "react";
import TripPlannerAI from "./TripPlannerAI";

export default function TripWellHub() {
  const [userData, setUserData] = useState(null);
  const [tripData, setTripData] = useState(null);
  const [activeSection, setActiveSection] = useState("trip"); // trip | ai | profile

  useEffect(() => {
    const fetchUserAndTrip = async () => {
      try {
        const userRes = await fetch("https://gofastbackend.onrender.com/api/users/me", {
          credentials: "include",
        });
        const user = await userRes.json();
        setUserData(user);

        if (user.tripId) {
          const tripRes = await fetch(`https://gofastbackend.onrender.com/api/trips/${user.tripId}`);
          const trip = await tripRes.json();
          setTripData(trip);
        }
      } catch (err) {
        console.error("🔥 Error loading user/trip:", err);
      }
    };

    fetchUserAndTrip();
  }, []);

  if (!userData || !tripData) {
    return <div className="p-6 text-center text-gray-500">Loading TripWell...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold">Welcome, {userData.preferredName || userData.name}</h2>

      <div className="flex space-x-4">
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

      {activeSection === "trip" && (
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
