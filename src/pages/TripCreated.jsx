import { useNavigate } from "react-router-dom";

export default function TripCreated({ trip }) {
  const navigate = useNavigate();

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
      <h1 className="text-3xl font-bold text-center text-green-700">
        Congrats — Your Trip Has Been Created
      </h1>

      <div className="bg-white shadow rounded-lg p-4 space-y-2 border">
        <p>
          <strong>Trip Name:</strong> {trip.tripName}
        </p>
        <p>
          <strong>Destination:</strong> {trip.city}
        </p>
        <p>
          <strong>Dates:</strong>{" "}
          {new Date(trip.startDate).toLocaleDateString()} –{" "}
          {new Date(trip.endDate).toLocaleDateString()}
        </p>
        <p>
          <strong>Trip Code:</strong>{" "}
          <span className="font-mono text-blue-600">
            {trip.joinCode || trip._id}
          </span>
        </p>
      </div>

      <div className="space-y-4 text-gray-700">
        <h2 className="text-xl font-semibold">Want to Invite Friends?</h2>
        <p>
          Share this trip code with them:{" "}
          <strong className="text-blue-600">{trip.joinCode || trip._id}</strong>
        </p>
        <p>Ask them to:</p>
        <ol className="list-decimal pl-5 text-sm text-gray-600">
          <li>Download TripWell from the App Store</li>
          <li>Select “Join a Trip”</li>
          <li>
            Enter the code: <strong>{trip.joinCode || trip._id}</strong>
          </li>
        </ol>
        <p className="text-xs italic text-gray-500">
          Here's a message you can copy and paste:
        </p>
        <textarea
          value={shareMessage}
          readOnly
          className="w-full border rounded p-2 bg-gray-50 font-mono text-sm"
          rows={4}
        />

        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            📋 Copy Message
          </button>
          <button
            onClick={() => window.open("https://tripwell.app/download", "_blank")}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
          >
            📱 Get TripWell App
          </button>
        </div>
      </div>

      {/* Nav prompt block */}
      <div className="mt-8 space-y-4 text-center">
        <p className="text-lg font-semibold">
          Ready to plan the rest of your trip?
        </p>
        <button
          onClick={() => navigate(`/tripwell/tripintent/${trip._id}`)}
          className="mx-2 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition"
        >
          Yes! Let’s Go
        </button>

        <p>Or come back later — just hit “Build My TripWell Experience” from home.</p>
      </div>
    </div>
  );
}
