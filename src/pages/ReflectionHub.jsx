import { useNavigate } from "react-router-dom";

export default function ReflectionHub() {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-800">
          🎉 Congrats! You've completed your trip
        </h1>
        <p className="text-lg text-gray-600">
          Ready to reflect on your journey?
        </p>
        <p className="text-sm text-gray-500 bg-purple-50 p-3 rounded-lg">
          🧪 Local State Test Flow
        </p>
      </div>

      <div className="space-y-4">
        <button 
          onClick={() => navigate("/reflection")}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-4 px-6 rounded-lg transition-colors text-lg flex items-center justify-center space-x-2"
        >
          <span>📝</span>
          <span>Start Reflection</span>
        </button>
        
        <button 
          onClick={() => {
            // Reset localStorage for a fresh start
            localStorage.removeItem("tripData");
            localStorage.removeItem("tripIntentData");
            localStorage.removeItem("anchorSelectData");
            localStorage.removeItem("itineraryData");
            console.log("🔄 Reset localStorage for fresh start");
            navigate("/");
          }}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-4 px-6 rounded-lg transition-colors text-lg flex items-center justify-center space-x-2"
        >
          <span>🔄</span>
          <span>Start New Trip</span>
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
