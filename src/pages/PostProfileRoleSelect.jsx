import { useNavigate } from "react-router-dom";

export default function PostProfileRoleSelect() {
  const navigate = useNavigate();

  const handleStartTrip = () => {
    console.log("🚀 User chose to start a trip");
    navigate("/pretripsetup");
  };

  const handleJoinTrip = () => {
    console.log("👥 User chose to join a trip");
    navigate("/join");
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
        <div className="space-y-6">
          {/* TripWell Logo */}
          <div className="flex flex-col items-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L12 21L16 22V20.5L14 19V13.5L22 16Z"/>
              </svg>
            </div>
            
            <div className="text-center space-y-3">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                What would you like to do?
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Choose how you'd like to start your travel planning adventure
              </p>
            </div>
          </div>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Start a Trip Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl cursor-pointer transform hover:-translate-y-1"
               onClick={handleStartTrip}>
            <div className="text-center space-y-4">
              <div className="text-4xl">🚀</div>
              <h2 className="text-2xl font-bold text-blue-800">Start a Trip</h2>
              <p className="text-blue-700 leading-relaxed">
                Create and plan your own adventure. You'll be the trip organizer and can invite others to join.
              </p>
              <div className="pt-4">
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                  Let's Plan! →
                </button>
              </div>
            </div>
          </div>

          {/* Join a Trip Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-2xl border-2 border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-xl cursor-pointer transform hover:-translate-y-1"
               onClick={handleJoinTrip}>
            <div className="text-center space-y-4">
              <div className="text-4xl">🎉</div>
              <h2 className="text-2xl font-bold text-green-800">Join a Friend's Trip</h2>
              <p className="text-green-700 leading-relaxed">
                Get excited! Your friend has already planned an amazing trip and invited you. Enter their join code to jump in on the adventure!
              </p>
              <div className="pt-4">
                <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                  I'm In! Let's Go! →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center space-y-4 pt-6 border-t border-gray-100">
          <p className="text-gray-600 text-sm">
            Not sure which to choose? 
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <button 
              onClick={() => navigate("/explainer")}
              className="text-blue-600 hover:text-blue-700 font-medium underline decoration-2 underline-offset-2 transition-colors"
            >
              Learn More About TripWell
            </button>
            <button 
              onClick={() => navigate("/bestthings")}
              className="text-green-600 hover:text-green-700 font-medium underline decoration-2 underline-offset-2 transition-colors"
            >
              Try Demo Features
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
