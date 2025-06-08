// src/pages/Home.jsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTripContext } from "../context/TripContext"; // ✅ pulls in user/trip/loading
import tripwellLogo from "../assets/tripwell-logo.png";

export default function Home() {
  const navigate = useNavigate();
  const { user, trip, loading } = useTripContext(); // ✅ use context, not getAuth()

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      if (!user) {
        navigate("/explainer");
      } else if (!trip) {
        navigate("/generalhub");
      } else {
        navigate("/trip/hub");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [user, trip, loading]);

  return (
    <div className="flex justify-center items-center h-screen bg-white">
      <img
        src={tripwellLogo}
        alt="TripWell Logo"
        className="w-48 h-auto"
      />
    </div>
  );
}
