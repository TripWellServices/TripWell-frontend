import { useState } from "react";

export default function TripWellHub() {
  const [activeTab, setActiveTab] = useState("travel");

  const tabs = [
    { id: "travel", label: "Travel Details" },
    { id: "lodging", label: "Hotel Info" },
    { id: "fitness", label: "Fitness & Movement" },
    { id: "vibe", label: "Trip Intentions" }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">TripWell Hub</h2>

      <div className="flex space-x-4 border-b mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2 border-b-2 ${
              activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "travel" && (
          <div>
            <h3 className="text-xl font-semibold mb-2">Add Flights or Transport</h3>
            <p className="text-sm text-gray-600 mb-4">Add flight times, train bookings, or local transport here.</p>
            {/* TODO: Form goes here */}
          </div>
        )}

        {activeTab === "lodging" && (
          <div>
            <h3 className="text-xl font-semibold mb-2">Add Hotel Info</h3>
            <p className="text-sm text-gray-600 mb-4">Hotel name, check-in, check-out, location, etc.</p>
            {/* TODO: Form goes here */}
          </div>
        )}

        {activeTab === "fitness" && (
          <div>
            <h3 className="text-xl font-semibold mb-2">Fitness & Movement</h3>
            <p className="text-sm text-gray-600 mb-4">Running routes, local gyms, GoFast mode.</p>
            {/* TODO: Fitness modal or quick plan */}
          </div>
        )}

        {activeTab === "vibe" && (
          <div>
            <h3 className="text-xl font-semibold mb-2">Trip Vibe & Purpose</h3>
            <p className="text-sm text-gray-600 mb-4">What matters most on this trip? Bonding? Exploration? Rest?</p>
            {/* TODO: Vibe tags or intention journal */}
          </div>
        )}
      </div>
    </div>
  );
}
