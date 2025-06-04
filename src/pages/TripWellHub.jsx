import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

export default function TripWellHub() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("Trip");

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      setUser({
        name: currentUser.displayName || "Traveler",
        email: currentUser.email,
      });
    }
  }, []);

  if (!user) {
    return (
      <div className="p-6 text-center text-red-500">
        No user found. Please return to Home.
      </div>
    );
  }

  const firstName = user.name.split(" ")[0];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-2">Hi {firstName},</h2>
      <p className="text-gray-700 mb-6">
        Welcome to your TripWell hub. Let’s plan something epic.
      </p>

      {/* TAB NAVIGATION */}
      <div className="flex space-x-4 border-b mb-6">
        {["Trip", "AI"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 border-b-2 ${
              activeTab === tab
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-gray-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {activeTab === "Trip" && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Your Trip</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
            ullamcorper, nisl eget vehicula feugiat, nunc arcu aliquet quam, a
            commodo velit justo id neque.
          </p>
        </div>
      )}

      {activeTab === "AI" && (
        <div>
          <h3 className="text-xl font-semibold mb-2">AI Planner</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer ut
            blandit sapien. Morbi sit amet orci luctus, sollicitudin mi nec,
            luctus lacus.
          </p>
        </div>
      )}
    </div>
  );
}
