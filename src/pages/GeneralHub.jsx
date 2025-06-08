import { useNavigate } from "react-router-dom";
import { getUserAndTrip } from "../services/userService";


export default function GeneralHub() {
  const { user, loading } = useTripContext();
  const navigate = useNavigate();

  if (loading) {
    return <div className="p-6 text-gray-600">Loading your travel dashboard…</div>;
  }

  const firstName = user?.displayName?.split(" ")[0] || "traveler";

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-2">
        Welcome to TripWell, {firstName}.
      </h1>
      <p className="text-center text-gray-600">
        Start your travel mission below.
      </p>

      <div className="flex flex-col items-center space-y-4 mt-6">
        <button
          onClick={() => navigate("/tripsetup")}
          className="w-[280px] bg-blue-600 text-white py-3 rounded-lg shadow hover:bg-blue-700"
        >
          ✈️ Start a New Trip
        </button>

        <button
          onClick={() => navigate("/join-trip")}
          className="w-[280px] bg-green-600 text-white py-3 rounded-lg shadow hover:bg-green-700"
        >
          👯 Join an Existing Trip
        </button>
      </div>
    </div>
  );
}