import { useState } from "react";
import TripPlannerAI from "./TripPlannerAI";

export default function TripWellHub({ tripData, userData }) {
  const [activeTab, setActiveTab] = useState("tripDetails");

  const tabs = [
    { id: "tripDetails", label: "Trip Details" },
    { id: "participants", label: "Who's in Your Trip" },
    { id: "addDetails", label: "Add Details" },
    { id: "seePlan", label: "See Your Plan" },
    { id: "profile", label: "Edit Profile" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Welcome to TripWell!</h2>

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
            <p>Destination: {tripData.destination}</p>
            <p>Travel Dates: {tripData.dates.join(" to ")}</p>
            {/* Add other basic details here */}
          </div>
        )}

        {activeTab === "participants" && (
          <div>
            <h3 className="text-xl font-semibold">Who's in Your Trip</h3>
            {/* Display list of participants */}
            <ul>
              {tripData.participants.map((person) => (
                <li key={person.id}>{person.name}</li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "addDetails" && (
          <div>
            <h3 className="text-xl font-semibold">Add Details</h3>
            {/* Form or input sections for lodging, activities */}
            <p>Add your hotel, planned activities, etc.</p>
          </div>
        )}

        {activeTab === "seePlan" && (
          <div>
            <h3 className="text-xl font-semibold">See Your Plan</h3>
            {/* Visual representation of the trip plan */}
            <p>Here’s your trip plan for the next few days...</p>
          </div>
        )}

        {activeTab === "profile" && (
          <div>
            <h3 className="text-xl font-semibold">Edit Profile</h3>
            {/* Profile details, preferences */}
            <p>Update your personal preferences or contact info here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
