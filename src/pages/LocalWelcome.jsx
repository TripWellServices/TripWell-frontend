import { useNavigate } from "react-router-dom";

export default function LocalWelcome() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome to TripWell (Local State Test)
        </h1>
        <p className="text-lg text-gray-600">
          We're here to help you plan your trip and make memories.
        </p>
        <p className="text-sm text-gray-500 bg-yellow-50 p-3 rounded-lg">
          🧪 This is a test flow using localStorage-first routing
        </p>
      </div>

      <div className="space-y-4">
        <button 
          onClick={() => navigate("/access")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-lg"
        >
          Sign Up
        </button>
        <button 
          onClick={() => navigate("/access")}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-lg"
        >
          Sign In
        </button>
      </div>

      <div className="text-center">
        <button 
          onClick={() => navigate("/")}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          ← Back to Main App
        </button>
      </div>
    </div>
  );
}
