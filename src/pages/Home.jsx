import { useTrip } from "../context/TripContext";

export default function Home() {
  const { firebaseUser, mongoUser, trip } = useTrip();

  console.log("🔍 firebaseUser", firebaseUser);
  console.log("🔍 mongoUser", mongoUser);
  console.log("🔍 trip", trip);

  if (!firebaseUser || !mongoUser) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>🏠 Home</h1>
      <p>Welcome, {mongoUser.name || "Traveler"}!</p>
      {trip ? (
        <>
          <h2>Your Trip:</h2>
          <pre>{JSON.stringify(trip, null, 2)}</pre>
        </>
      ) : (
        <p>No active trip found.</p>
      )}
    </div>
  );
}
