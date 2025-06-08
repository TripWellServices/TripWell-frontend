import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTripContext } from "../context/TripContext";
import logo from "../assets/tripwell-logo.png"; // ✅ imported from src

export default function Home() {
  const { firebaseUser, mongoUser, trip, loading } = useTripContext();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!firebaseUser) {
        navigate("/explainer");
      } else if (!trip) {
        navigate("/generalhub");
      } else {
        navigate("/trip/hub");
      }
    }, 3000); // wait 3 seconds

    return () => clearTimeout(timer);
  }, [firebaseUser, trip, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <img
        src={logo}
        alt="TripWell Logo"
        className="w-40 h-auto"
      />
    </div>
  );
}
