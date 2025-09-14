import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import axios from "axios";
import BACKEND_URL from "../config";

export default function PreTripHub() {
  const navigate = useNavigate();

  // Get data from localStorage
  const tripData = JSON.parse(localStorage.getItem("tripData") || "null");
  const itineraryData = JSON.parse(localStorage.getItem("itineraryData") || "null");

  // Calculate days until trip
  const getDaysUntilTrip = () => {
    if (!tripData?.startDate) return null;
    
    const today = new Date();
    const startDate = new Date(tripData.startDate);
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const daysUntilTrip = getDaysUntilTrip();

  const handleStartTrip = async () => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        console.error("❌ No authenticated user");
        return;
      }

      const token = await firebaseUser.getIdToken();
      
      // Plant the trip start flag in backend
      await axios.post(`${BACKEND_URL}/tripwell/starttrip/${tripData.tripId || tripData._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Navigate to live day returner for "welcome back" flow
      navigate("/livedayreturner");
    } catch (error) {
      console.error("❌ Error starting trip:", error);
      // Still navigate even if backend fails
      navigate("/livedayreturner");
    }
  };

  const handleReviewItinerary = () => {
    navigate("/tripdaysoverview");
  };

  const handleModifyTrip = () => {
    navigate("/tripintent");
  };

  // If no trip data, show error
  if (!tripData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-300 to-blue-200 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-4xl">⚠️</div>
          <h2 className="text-xl font-semibold text-red-700">No trip found</h2>
          <button 
            onClick={() => navigate("/")}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-300 to-blue-200 flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-3xl shadow-2xl">
        <div className="text-center space-y-8">
          {/* Trip Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-800">Your Trip is Ready!</h1>
            <p className="text-lg text-gray-600">Time to start your adventure</p>
          </div>

          {/* Trip Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 text-left">
            <h2 className="text-2xl font-semibold text-blue-600 mb-2">{tripData.tripName}</h2>
            <p className="text-gray-600 mb-2">📍 {tripData.city}</p>
            <p className="text-gray-600 mb-2">
              📅 {new Date(tripData.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - {new Date(tripData.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="text-gray-600">👥 {tripData.partyCount} travelers</p>
            {itineraryData && (
              <p className="text-gray-600">📋 {itineraryData.days.length} days planned</p>
            )}
          </div>

          {/* Countdown */}
          {daysUntilTrip !== null && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">⏰ Trip Countdown</h3>
              {daysUntilTrip > 0 ? (
                <p className="text-2xl font-bold text-green-600">
                  {daysUntilTrip} {daysUntilTrip === 1 ? 'day' : 'days'} until your trip to {tripData.city}!
                </p>
              ) : daysUntilTrip === 0 ? (
                <p className="text-2xl font-bold text-green-600">
                  🎉 Your trip to {tripData.city} starts today!
                </p>
              ) : (
                <p className="text-2xl font-bold text-green-600">
                  🚀 Your trip to {tripData.city} is in progress!
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleStartTrip}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 font-semibold text-lg"
            >
              🚀 Start My Trip
            </button>

            <button
              onClick={handleModifyTrip}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-2xl hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 font-semibold text-lg"
            >
              🛠 Modify Trip Details
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 text-blue-800 rounded-lg p-4 text-center text-sm">
            <p className="font-semibold">Ready to begin your adventure?</p>
            <p className="text-xs mt-1">Click "Start My Trip" to begin your live trip experience!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
