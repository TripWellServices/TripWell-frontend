import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function HydrateLocal() {
  const navigate = useNavigate();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Show loading screen for 800ms, then navigate to Universal Router
    const loadingTimeout = setTimeout(() => {
      console.log("✅ HydrateLocal loading complete, navigating to Universal Router");
      navigate("/localrouter");
    }, 800);

    return () => clearTimeout(loadingTimeout);
  }, [navigate]);


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
            
            {/* TripWell Text */}
            <div className="text-center space-y-3">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Loading Your Adventure
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Getting your trip data ready...
              </p>
            </div>
          </div>
        </div>

        {/* Loading spinner */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
}
