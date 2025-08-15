import { useNavigate } from "react-router-dom";

export default function PreTripHub() {
  const navigate = useNavigate();

  // Get data from localStorage
  const tripData = JSON.parse(localStorage.getItem("tripData") || "null");
  const tripIntentData = JSON.parse(localStorage.getItem("tripIntentData") || "null");
  const anchorSelectData = JSON.parse(localStorage.getItem("anchorSelectData") || "null");
  const itineraryData = JSON.parse(localStorage.getItem("itineraryData") || "null");

  const startTrip = () => {
    // Update tripData to mark trip as started
    const updatedTripData = {
      ...tripData,
      startedTrip: true
    };
    localStorage.setItem("tripData", JSON.stringify(updatedTripData));
    console.log("💾 Updated tripData - startedTrip: true");
    
    navigate("/tripcomplete"); // For now, just go to completion
  };

  // If no localStorage data, show error
  if (!tripData || !tripIntentData || !anchorSelectData || !itineraryData) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Missing Data</h1>
          <p className="text-gray-600">Please start from the beginning.</p>
          <button 
            onClick={() => navigate("/")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-800">
          🎉 You're All Set!
        </h1>
        <p className="text-lg text-gray-600">
          Your trip is planned and ready to go.
        </p>
        <p className="text-sm text-gray-500 bg-green-50 p-3 rounded-lg">
          🚀 Ready to start your adventure
        </p>
      </div>

      {/* Trip Summary */}
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Trip Summary</h2>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Trip:</span>
            <p className="text-gray-900">{tripData.tripName}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Destination:</span>
            <p className="text-gray-900">{tripData.city}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Dates:</span>
            <p className="text-gray-900">{tripData.startDate} to {tripData.endDate}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Travelers:</span>
            <p className="text-gray-900">{tripData.partyCount} people</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <span className="font-medium text-gray-600">Your Priorities:</span>
          <p className="text-gray-900">{tripIntentData.priorities.join(", ")}</p>
        </div>

        <div className="border-t pt-4">
          <span className="font-medium text-gray-600">Budget:</span>
          <p className="text-gray-900">{tripIntentData.budget || "Not specified"}</p>
        </div>

        <div className="border-t pt-4">
          <span className="font-medium text-gray-600">Selected Anchors:</span>
          <p className="text-gray-900">{anchorSelectData.anchors.length} experiences chosen</p>
        </div>

        <div className="border-t pt-4">
          <span className="font-medium text-gray-600">Itinerary:</span>
          <p className="text-gray-900">{itineraryData.days.length} days planned</p>
        </div>
      </div>

      <div className="space-y-4">
        <button 
          onClick={startTrip}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-6 rounded-lg transition-colors text-lg flex items-center justify-center space-x-2"
        >
          <span>🚀</span>
          <span>Start My Trip!</span>
        </button>
        
        <button 
          onClick={() => navigate("/")}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-4 px-6 rounded-lg transition-colors text-lg flex items-center justify-center space-x-2"
        >
          <span>🏠</span>
          <span>Back to Main App</span>
        </button>
      </div>
    </div>
  );
}
