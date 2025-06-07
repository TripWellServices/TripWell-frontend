import { useTripContext } from "../context/TripContext";
import { useNavigate } from "react-router-dom";

export default function TripCreated() {
  const { trip, loading } = useTripContext();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading your trip...
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        🚫 Could not load trip. Please try again or create a new one.
      </div>
    );
  }

  const shareMessage = `Hey! Join me on TripWell to plan our ${trip.city} trip.\n\nTrip code: ${trip.joinCode || trip._id}\nDownload: https://tripwell.app/download`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareMessage);
    alert("Message copied to clipboard!");
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center text-green-700">Congrats — Your Trip Has Been Created</h1>

      <div className="bg-white shadow rounded-lg p-4 space-y-2 border">
        <p><strong>Trip Name:</strong> {trip.tripName}</p>
        <p><strong>Destination:</strong> {trip.city}</p>
        <p><strong>Dates:</strong> {new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}</p>
        <p><strong>Trip Code:</strong> <span className="font-mono text-blue-600">{trip.joinCode || trip._id}</span></p>
      </div>

      <div className="space-y-4 text-gray-700">
        <h2 className="text-xl font-semibold">What Happens Next</h2>
        <p>
          From the <strong>General Hub</strong>, select <strong>My Trips</strong>. Find your trip: <em>{trip.tripName}</em>, then choose <strong>Add Trip Details</strong> to begin planning.
        </p>
        <ul className="list-disc pl-5 text-sm text-gray-600">
          <li>Add Flights</li>
          <li>Add Lodging</li>
          <li>Add Food</li>
          <li>Add Attractions</li>
        </ul>
      </div>

      <div className="space-y-4 text-gray-700">
        <h2 className="text-xl font-semibold">Want to Invite Friends?</h2>
        <p>
          Share this trip code with them: <strong className="text-blue-600">{trip.joinCode || trip._id}</strong>
        </p>
        <p>Ask them to:</p>
        <ol className="list-decimal pl-5 text-sm text-gray-600">
          <li>Download TripWell from the App Store</li>
          <li>Select “Join a Trip”</li>
          <li>Enter the code: <strong>{trip.joinCode || trip._id}</strong></li>
        </ol>
        <p className="text-xs italic text-gray-500">Here's a message you can copy and paste:</p>
        <textarea
          value={shareMessage}
          readOnly
          className="w-full border rounded p-2 bg-gray-50 font-mono text-sm"
          rows={4}
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCopy}
            className="w-full sm:w-auto bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            📋 Copy Message
          </button>
          <button
            onClick={() => window.open("https://tripwell.app/download", "_blank")}
            className="w-full sm:w-auto bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
          >
            📱 Get TripWell App
          </button>
          <button
            onClick={() => navigate("/general-hub")}
            className="w-full sm:w-auto bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
          >
            👉 Go to General Hub
          </button>
        </div>
      </div>
    </div>
  );
}
