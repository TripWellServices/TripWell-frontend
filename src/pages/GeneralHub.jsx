import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

export default function GeneralHub() {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;
  const firstName = user?.displayName?.split(" ")[0] || "traveler";

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-2">
        Welcome to TripWell, {firstName}.
      </h1>
      <p className="text-center text-gray-600">Start your travel mission below.</p>

      <div className="grid gap-4 mt-6">
        <div className="flex flex-col space-y-4">
          <button
            onClick={() => navigate("/tripsetup")}
            className="w-full bg-blue-600 text-white py-3 rounded-lg shadow hover:bg-blue-700"
          >
            ✈️ Start a New Trip
          </button>

          <button
            onClick={() => navigate("/join-trip")}
            className="w-full bg-green-600 text-white py-3 rounded-lg shadow hover:bg-green-700"
          >
            🔗 Join with a Code
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg shadow hover:bg-gray-300"
          >
            🧑‍💼 Edit My Profile
          </button>
        </div>
      </div>
    </div>
  );
}
