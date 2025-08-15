import { useNavigate } from "react-router-dom";
import {
  PlaneTakeoff,
  Users,
  Info,
  TestTube,
} from "lucide-react";

export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome to TripWell
        </h1>
        <p className="text-lg text-gray-600">
          We're here to help you plan your trip and make memories.
        </p>
        <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
          🚀 Universal localStorage-first routing
        </p>
      </div>

      <div className="space-y-4">
        <button 
          onClick={() => navigate("/localrouter")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-lg flex items-center justify-center space-x-2"
        >
          <PlaneTakeoff className="w-5 h-5" />
          <span>Start Planning My Trip</span>
        </button>
        
        <button 
          onClick={() => navigate("/join")}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-lg flex items-center justify-center space-x-2"
        >
          <Users className="w-5 h-5" />
          <span>Join a Friend's Trip</span>
        </button>
      </div>

      <div className="space-y-3">
        <button 
          onClick={() => navigate("/explainer")}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors text-lg flex items-center justify-center space-x-2"
        >
          <Info className="w-5 h-5" />
          <span>What is TripWell?</span>
        </button>
        
        <button 
          onClick={() => navigate("/localdebug")}
          className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium py-3 px-6 rounded-lg transition-colors text-lg flex items-center justify-center space-x-2"
        >
          <TestTube className="w-5 h-5" />
          <span>Debug Local State</span>
        </button>
      </div>
    </div>
  );
}
