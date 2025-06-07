import { useTripContext } from "../context/TripContext";

export default function TripWrapper({ children }) {
  const { user, trip, loading } = useTripContext();

  if (loading) {
    return <div className="p-6 text-gray-700">Loading TripWell magic…</div>;
  }

  if (!user || !trip) {
    return (
      <div className="p-6 text-red-600 font-semibold">
        🚫 Could not load trip or user. Please refresh or log in again.
      </div>
    );
  }

  return children;
}