import { useParams, useNavigate } from "react-router-dom";

export default function LiveDay() {
  const { dayNumber } = useParams();
  const navigate = useNavigate();

  const completeDay = () => {
    const nextDay = parseInt(dayNumber) + 1;
    
    // Update tripData with lastDayVisited
    const tripData = JSON.parse(localStorage.getItem("tripData") || "null");
    if (tripData) {
      const updatedTripData = { ...tripData, lastDayVisited: nextDay };
      localStorage.setItem("tripData", JSON.stringify(updatedTripData));
      console.log("💾 Updated tripData with lastDayVisited:", nextDay);
    }
    
    if (nextDay > 3) {
      // Trip is complete
      if (tripData) {
        const completedTripData = { ...tripData, tripComplete: true };
        localStorage.setItem("tripData", JSON.stringify(completedTripData));
        console.log("💾 Trip complete - setting tripComplete to true");
      }
      navigate("/tripcomplete");
    } else {
      navigate(`/liveday/${nextDay}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-800">
          🚀 Day {dayNumber} of Your Trip
        </h1>
        <p className="text-lg text-gray-600">
          Welcome to your adventure! This is day {dayNumber} of your trip.
        </p>
        <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
          🧪 Local State Test Flow - Simulated Live Day
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Today's Plan</h2>
        <div className="space-y-3">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-medium">🌅 Morning</h3>
            <p className="text-gray-600">Start your day with a local breakfast</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-medium">☀️ Afternoon</h3>
            <p className="text-gray-600">Explore the city and visit landmarks</p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="font-medium">🌙 Evening</h3>
            <p className="text-gray-600">Enjoy dinner and local entertainment</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button 
          onClick={completeDay}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-6 rounded-lg transition-colors text-lg flex items-center justify-center space-x-2"
        >
          <span>✅</span>
          <span>Complete Day {dayNumber}</span>
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
