import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTripContext } from "../context/TripContext";
import logo from "../assets/tripwell-logo.png";

export default function Home() {
  const { user, trip, loading } = useTripContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      if (!user) {
        navigate("/explainer");
      } else if (trip?._id) {
        navigate("/tripwellhub");
      } else {
        navigate("/hub");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [loading, user, trip, navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center px-6 bg-white">
      <img
        src={logo}
        alt="TripWell Logo"
        className="w-16 h-16 md:w-20 md:h-20 mb-4 object-contain"
      />
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome to TripWell</h1>
      <p className="text-gray-600 mb-6 max-w-md">
        Your co-pilot for calm, clear travel planning.
      </p>
      <p className="text-sm text-gray-400">Checking your trip...</p>
    </div>
  );
}
