import { useNavigate } from "react-router-dom";

export default function PreTripHub() {
  const navigate = useNavigate();

  const startTrip = () => {
    localStorage.setItem("tripStatus", "live");
    localStorage.setItem("lastDayVisited", "1");
    console.log("🚀 Starting trip - setting localStorage:", {
      tripStatus: "live",
      lastDayVisited: "1"
    });
    navigate("/liveday/1");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Pre-Trip Hub
        </h1>
        <p className="text-lg text-gray-600">
          You're all set! Ready to start your adventure?
        </p>
        <p className="text-sm text-gray-500 bg-green-50 p-3 rounded-lg">
          🧪 Local State Test Flow
        </p>
      </div>

      <div className="space-y-4">
        <button 
          onClick={() => navigate("/itineraryreview")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-colors text-lg flex items-center justify-center space-x-2"
        >
          <span>📋</span>
          <span>Check Your Itinerary</span>
        </button>
        
        <button 
          onClick={startTrip}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-6 rounded-lg transition-colors text-lg flex items-center justify-center space-x-2"
        >
          <span>🚀</span>
          <span>Start My Trip!</span>
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
