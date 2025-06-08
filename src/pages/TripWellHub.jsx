
import { useNavigate } from "react-router-dom";
import { getUserAndTrip } from "../services/userService";

export default function TripWellHub() {
  const { user, trip, loading } = useTripContext();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center p-6 bg-white">
        <p className="text-lg text-gray-500">Loading your TripWell hub...</p>
      </div>
    );
  }

  if (!user || !trip) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center p-6 bg-white">
        <p className="text-red-600 font-semibold">
          Could not load trip or user data. Please refresh or try again.
        </p>
      </div>
    );
  }

  const firstName = user?.displayName?.split(" ")[0] || "traveler";

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6 py-10 text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Welcome, {firstName}
      </h1>

      <p className="text-md text-gray-600 mb-2">
        Your current trip to <strong>{trip.city}</strong> for <strong>{trip.purpose}</strong>
      </p>
      <p className="text-sm text-gray-500 mb-6">
        {trip.startDate} → {trip.endDate}
      </p>

      <div className="flex flex-col space-y-4 w-full max-w-xs">
        <button
          onClick={() => navigate("/tripchat")}
          className="bg-purple-600 text-white py-3 px-4 rounded-lg shadow hover:bg-purple-700 transition"
        >
          💬 Open Trip Chat
        </button>

        <button
          onClick={() => navigate("/itinerary")}
          className="bg-blue-600 text-white py-3 px-4 rounded-lg shadow hover:bg-blue-700 transition"
        >
          📅 View Itinerary
        </button>
      </div>
    </div>
  );
}