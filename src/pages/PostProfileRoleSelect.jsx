import { useNavigate } from "react-router-dom";

export default function PostProfileRoleSelect() {
  const navigate = useNavigate();

  const handleStartTrip = () => {
    console.log("🚀 User chose to start a trip");
    navigate("/tripsetup");
  };

  const handleJoinTrip = () => {
    console.log("👥 User chose to join a trip");
    navigate("/join");
  };



  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-6">
          {/* TripWell Logo */}
          <div className="flex flex-col items-center space-y-4">
            <svg 
              width="120" 
              height="120" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-lg"
            >
              <path 
                d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L12 21L16 22V20.5L14 19V13.5L22 16Z" 
                fill="#3b82f6"
              />
            </svg>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                <span className="text-blue-600">Trip</span>
                <span className="text-indigo-600">Well</span>
              </h1>
              <p className="text-lg text-gray-600 font-medium">
                What would you like to do?
              </p>
            </div>
          </div>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Start a Trip Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg cursor-pointer"
               onClick={handleStartTrip}>
            <div className="text-center space-y-4">
              <div className="text-4xl">🚀</div>
              <h2 className="text-2xl font-bold text-blue-800">Start a Trip</h2>
              <p className="text-blue-700">
                Create and plan your own adventure. You'll be the trip organizer and can invite others to join.
              </p>
              <div className="pt-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-lg font-semibold transition-colors duration-200">
                  Let's Plan! →
                </button>
              </div>
            </div>
          </div>

          {/* Join a Trip Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-2xl border-2 border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg cursor-pointer"
               onClick={handleJoinTrip}>
            <div className="text-center space-y-4">
              <div className="text-4xl">👥</div>
              <h2 className="text-2xl font-bold text-green-800">Join a Trip</h2>
              <p className="text-green-700">
                Join an existing trip using a join code (like "PARIS2025"). You'll be a participant and can view the itinerary.
              </p>
              <div className="pt-4">
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-lg font-semibold transition-colors duration-200">
                  Join Trip →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center space-y-4 pt-8">
          <p className="text-gray-600 text-sm">
            Not sure which to choose? 
          </p>
          <div className="flex justify-center space-x-4 text-sm">
            <button 
              onClick={() => navigate("/explainer")}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Learn More About TripWell
            </button>
            <button 
              onClick={() => navigate("/bestthings")}
              className="text-green-600 hover:text-green-800 underline"
            >
              Try Demo Features
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
