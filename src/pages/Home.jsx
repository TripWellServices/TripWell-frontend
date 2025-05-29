import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/explainer");
    }, 1500); // short delay to flash brand before redirect

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-5xl font-bold mb-4">TripWell</h1>
      <p className="text-lg text-gray-600">Your smart co-pilot for travel planning and execution.</p>
    </div>
  );
}
