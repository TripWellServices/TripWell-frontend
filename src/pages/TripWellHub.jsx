import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function TripWellHub() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser({
        firstName: currentUser.displayName?.split(" ")[0] || "Traveler",
        email: currentUser.email,
      });
    }
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center p-6 bg-white">
        <p className="text-lg text-gray-500">Loading your TripWell hub...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6 py-10 text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Welcome, {user.firstName}
      </h1>

      <div className="w-full max-w-md space-y-6 text-left">

        {/* My Trip Outlook */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-1">🧭 My Trip Outlook</h2>
          <p className="text-gray-600">Destination and dates coming soon. We’ll update this as you plan.</p>
        </div>

        {/* My Trip Group */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-1">👥 My Trip Group</h2>
          <p className="text-gray-600">Just you for now. Invite others once you’re ready.</p>
        </div>

        {/* Add Details (AI Planner) */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-1">🪄 Add Details</h2>
          <button
            onClick={() => navigate("/tripplannerai")}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition"
          >
            Plan with AI
          </button>
        </div>

        {/* Edit Profile */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-1">🛠️ Edit Profile</h2>
          <button
            onClick={() => navigate("/profilesetup")}
            className="mt-2 bg-gray-800 text-white px-4 py-2 rounded-xl shadow hover:bg-gray-900 transition"
          >
            Update My Info
          </button>
        </div>

      </div>

      {/* Final message */}
      <p className="mt-12 text-gray-500 italic">✨ Let’s make this trip unforgettable.</p>
    </div>
  );
}
