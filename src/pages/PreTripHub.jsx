import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import axios from "axios";
import BACKEND_URL from "../config";

export default function PreTripHub() {
  const navigate = useNavigate();

  // Get data from localStorage
  const tripData = JSON.parse(localStorage.getItem("tripData") || "null");
  const tripIntentData = JSON.parse(localStorage.getItem("tripIntentData") || "null");
  const anchorSelectData = JSON.parse(localStorage.getItem("anchorLogic") || "null");
  const itineraryData = JSON.parse(localStorage.getItem("itineraryData") || "null");

  const startTrip = async () => {
    try {
      // Wait for Firebase auth to be ready
      await new Promise(resolve => {
        const unsubscribe = auth.onAuthStateChanged(user => {
          unsubscribe();
          resolve(user);
        });
      });

      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        console.error("❌ No authenticated user");
        alert("Please sign in to start your trip.");
        return;
      }

      const token = await firebaseUser.getIdToken();
      
      // 🚨 PLANT THE FLAG IN BACKEND FIRST!
      console.log("🚨 Planting trip start flag in backend...");
      const startRes = await axios.post(`${BACKEND_URL}/tripwell/starttrip/${tripData.tripId || tripData._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("✅ Backend trip start flag planted:", startRes.data);

      // Update tripData with backend response and mark as started
      const updatedTripData = {
        ...tripData,
        startedTrip: true,
        tripStartedByOriginator: startRes.data.tripStartedByOriginator,
        tripStartedByParticipant: startRes.data.tripStartedByParticipant
      };
      localStorage.setItem("tripData", JSON.stringify(updatedTripData));
      console.log("💾 Updated tripData with backend flags");
      
      // Auto-determine current day index based on trip dates
      const today = new Date();
      const startDate = new Date(tripData.startDate);
      const endDate = new Date(tripData.endDate);
      
      // Calculate which day of the trip we're on
      let currentDayIndex = 1; // Default to day 1
      
      if (today >= startDate && today <= endDate) {
        // We're within the trip dates
        const diffTime = Math.abs(today - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        currentDayIndex = diffDays + 1; // +1 because day 1 is the first day
      } else if (today < startDate) {
        // Trip hasn't started yet
        currentDayIndex = 1;
      } else {
        // Trip is over
        currentDayIndex = itineraryData.days.length;
      }
      
      // Initialize progressive navigation state
      localStorage.setItem("currentDayIndex", currentDayIndex.toString());
      localStorage.setItem("currentBlockName", "morning"); // Always start with morning
      console.log("💾 Initialized progressive navigation: Day", currentDayIndex, "Block: morning");
      
      // Navigate directly to the live day experience!
      console.log("🚀 Navigating to live day experience");
      navigate("/tripliveday");
      
    } catch (error) {
      console.error("❌ Error starting trip:", error);
      alert("There was an error starting your trip. Please try again.");
    }
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
            <p className="text-gray-900">
              {new Date(tripData.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} to {new Date(tripData.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
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
          onClick={() => navigate("/tripdaysoverview")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-colors text-lg flex items-center justify-center space-x-2"
        >
          <span>✏️</span>
          <span>Modify Itinerary</span>
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
