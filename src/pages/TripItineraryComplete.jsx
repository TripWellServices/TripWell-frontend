import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TripItineraryComplete() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Auto-route to prephub after 3 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/prephub");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8 text-center">
        {/* Celebration Animation */}
        <div className="mb-8">
          <div className="text-8xl mb-4 animate-bounce">🎉</div>
          <div className="text-6xl mb-4 animate-pulse">✨</div>
          <div className="text-7xl animate-bounce" style={{ animationDelay: '0.5s' }}>🚀</div>
        </div>

        {/* Congratulations Message */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            Congratulations!
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">
            Your itinerary is complete and ready for adventure!
          </h2>
          
                     <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6">
             <h3 className="text-lg font-semibold text-gray-800 mb-4">
               What happens next:
             </h3>
             <ul className="text-left space-y-3 text-gray-700">
               <li className="flex items-start">
                 <span className="text-green-500 mr-3 text-xl">✓</span>
                 <span><strong>Going to Trip Hub:</strong> Your central command center for everything trip-related</span>
               </li>
               <li className="flex items-start">
                 <span className="text-green-500 mr-3 text-xl">✓</span>
                 <span><strong>Always accessible:</strong> You can check back anytime to modify your itinerary</span>
               </li>
               <li className="flex items-start">
                 <span className="text-green-500 mr-3 text-xl">✓</span>
                 <span><strong>When ready:</strong> Click "Start My Trip" to begin your adventure!</span>
               </li>
             </ul>
           </div>

          {/* Countdown */}
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              Taking you to your Trip Hub in...
            </p>
            <div className="text-3xl font-bold text-green-600">
              {countdown}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/prephub")}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-2xl hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 font-semibold"
          >
            🏠 Go to Trip Hub Now
          </button>
          <button
            onClick={() => navigate("/")}
            className="bg-gray-100 text-gray-700 px-8 py-3 rounded-2xl hover:bg-gray-200 transition-all duration-200 font-semibold"
          >
            🏠 Return Home
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${((3 - countdown) / 3) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
