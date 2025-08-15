import { useNavigate } from "react-router-dom";

export default function TripComplete() {
  const navigate = useNavigate();

  // Get data from localStorage
  const tripData = JSON.parse(localStorage.getItem("tripData") || "null");

  // Mark trip as complete
  if (tripData && !tripData.tripComplete) {
    const updatedTripData = {
      ...tripData,
      tripComplete: true
    };
    localStorage.setItem("tripData", JSON.stringify(updatedTripData));
    console.log("💾 Updated tripData - tripComplete: true");
  }

  return (
    <div className="p-8 max-w-2xl mx-auto text-center space-y-6">
      <h1 className="text-4xl font-bold text-green-700">🎉 Trip Complete</h1>
      <p className="text-lg text-gray-700">
        You made it. The trip may be over, but the memories are now a part of you.
      </p>
      <p className="text-md text-gray-600">
        Your reflections are safely stored. Revisit them anytime — or start dreaming up your next adventure.
      </p>

      <div className="space-y-4 mt-8">
        <button
          onClick={() => navigate(`/reflections`)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-lg"
        >
          📓 See My Trip Memories
        </button>

        <button
          onClick={() => {
            // Clear all trip data for fresh start
            localStorage.removeItem("tripData");
            localStorage.removeItem("tripIntentData");
            localStorage.removeItem("anchorSelectData");
            localStorage.removeItem("itineraryData");
            console.log("🔄 Cleared trip data for fresh start");
            navigate("/");
          }}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl text-lg"
        >
          ✈️ Plan Another Trip
        </button>
      </div>
    </div>
  );
}
