import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import logo from "../assets/tripwell-logo.png";

export default function Home() {
  const { authReady, firebaseUser, mongoUser } = useAuthUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authReady) return;

    const timer = setTimeout(() => {
      if (!firebaseUser) {
        navigate("/explainer");
      } else if (mongoUser?.tripId) {
        navigate("/tripwellhub");
      } else {
        navigate("/hub");
      }
    }, 2000); // ⏱️ Delay redirect 2s for visual hold

    return () => clearTimeout(timer);
  }, [authReady, firebaseUser, mongoUser, navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center px-6 bg-white">
      <img
        src={logo}
        alt="TripWell Logo"
        className="w-32 h-32 mb-4"
      />
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome to TripWell</h1>
      <p className="text-gray-600 mb-6 max-w-md">
        Your co-pilot for calm, clear travel planning.
      </p>
      <p className="text-sm text-gray-400">
        Checking your trip...
      </p>
    </div>
  );
}
