import { useNavigate } from "react-router-dom";
import logo from "../assets/tripwell-logo.png"; // ✅ this must match the file location

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center px-6 bg-white">
      <img
        src={logo}
        alt="TripWell Logo"
        className="w-48 h-48 mb-4"
      />
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome to TripWell</h1>
      <p className="text-gray-600 mb-6 max-w-md">
        Your co-pilot for calm, clear travel planning. Let's get started.
      </p>
      <button
        onClick={() => navigate("/explainer")}
        className="bg-blue-600 text-white px-6 py-3 rounded text-lg"
      >
        Get Started
      </button>

      <button
        onClick={() => navigate("/login")}
        className="mt-4 underline text-blue-700 text-sm"
      >
        Already have an account? Log in
      </button>
    </div>
  );
}
