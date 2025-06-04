import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

export default function TripWellHub() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      setUser({
        name: currentUser.displayName || "Traveler",
        email: currentUser.email,
      });
    }
  }, []);

  if (!user) {
    return (
      <div className="p-6 text-center text-red-500">
        No user found. Please return to Home.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Hi {user.name},</h2>
      <p className="text-gray-700">
        Your TripWell hub is ready. Let’s plan something epic.
      </p>

      <div className="flex flex-col gap-4 mt-6">
        <button className="bg-blue-600 text-white py-2 px-4 rounded">
          View Trip
        </button>
        <button className="bg-green-600 text-white py-2 px-4 rounded">
          Open AI Planner
        </button>
        <button className="bg-purple-600 text-white py-2 px-4 rounded">
          Edit Profile
        </button>
      </div>
    </div>
  );
}
