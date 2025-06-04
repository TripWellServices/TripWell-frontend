import { useEffect, useState } from "react";
import TripPlannerAI from "./TripPlannerAI";

export default function TripWellHub() {
  const [userData, setUserData] = useState(null);
  const [tripData, setTripData] = useState(null);
  const [activeTab, setActiveTab] = useState("tripDetails");

  const tabs = [
    { id: "tripDetails", label: "Trip Details" },
    { id: "participants", label: "Who's in Your Trip" },
    { id: "addDetails", label: "Add Details" },
    { id: "seePlan", label: "See Your Plan" },
    { id: "profile", label: "Edit Profile" },
  ];

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
        console.error("Error loading user or trip:", err);
      }
    };

    fetchUserAndTrip();
  }, []);

  if (!userData || !tripData) {
    return <div className="p-6 text-center text-gray-500">Loading TripWell...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Welcome to TripWell, {userData.preferredName || userData.name}!</h2>

      <div className="flex space-x-4 border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2 border-b-2 ${
              activeTab === tab.id ? "border-blue-600" : "border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === "tripDetails" && (
          <div>
            <h3 className="text-xl font-semibold">Trip Details</h3>
            <p>Trip Name: {tripData.tripName}</p>
            <p>Purpose: {tripData.purpose}</p>
            <p>
              Travel Dates: {new Date(tripData.startDate).toLocaleDateString()} to{" "}
              {new Date(tripData.endDate).toLocaleDateString()}
            </p>
          </div>
        )}

        {activeTab === "participants" && (
          <div>
            <h3 className="text-xl font-semibold">Who's in Your Trip</h3>
            <p>(Feature coming soon...)</p>
          </div>
        )}

        {activeTab === "addDetails" && (
          <div>
            <h3 className="text-xl font-semibold">Add Details</h3>
            <p>Add your hotel, planned activities, etc.</p>
          </div>
        )}

        {activeTab === "seePlan" && (
          <div>
            <TripPlannerAI />
          </div>
        )}

        {activeTab === "profile" && (
          <div>
            <h3 className="text-xl font-semibold">Edit Profile</h3>
            <p>Name: {userData.name}</p>
            <p>Email: {userData.email}</p>
            {/* Add edit form if needed */}
          </div>
        )}
      </div>
    </div>
  );
}
