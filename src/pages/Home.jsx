import { useTripContext } from "../context/TripContext";

export default function Home() {
  const { firebaseUser, mongoUser, trip, loading } = useTripContext();

  if (loading || !firebaseUser || !mongoUser || !trip) {
    return <div className="text-center mt-20 text-gray-500">Loading your trip...</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto text-center">
      <img
        src="/logo.png"
        alt="TripWell Logo"
        className="w-32 h-auto mx-auto my-6"
      />

      <h1 className="text-3xl font-bold mb-2">Welcome, traveler</h1>
      <p className="text-xl mb-2">
        Your current trip to <strong>{trip.city}</strong> for <em>{trip.reason}</em>
      </p>
      <p className="text-sm text-gray-500 mb-6">
        {new Date(trip.startDate).toLocaleDateString()} →{" "}
        {new Date(trip.endDate).toLocaleDateString()}
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <a
          href="/trip/chat"
          className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
        >
          💬 Open Trip Chat
        </a>
        <a
          href="/trip/itinerary"
          className="px-4 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 transition"
        >
          📅 View Itinerary
        </a>
      </div>
    </div>
  );
}
