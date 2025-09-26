import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function PreTripSetup() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gate check: Ensure user is authenticated and has profile data
    const userData = JSON.parse(localStorage.getItem("userData") || "null");
    
    if (!userData?.firebaseId) {
      console.log("❌ No user data in localStorage, navigating to /access");
      navigate("/access");
      return;
    }
    
    if (!userData?.firstName || !userData?.lastName) {
      console.log("❌ Profile data missing, navigating to /profilesetup");
      navigate("/profilesetup");
      return;
    }
    
    console.log("✅ User authenticated and profile complete, showing PreTripSetup");
    setUser(userData);
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-300 to-blue-200 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h1 className="text-2xl font-bold text-gray-800">Checking your setup...</h1>
          <p className="text-gray-600">Verifying your profile and authentication</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-300 to-blue-200 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
        {/* Header Section */}
        <div className="space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L12 21L16 22V20.5L14 19V13.5L22 16Z"/>
            </svg>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Ready to Begin? 🚀
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              We'll walk you through creating your trip step-by-step. Here's what happens next:
            </p>
            
            {/* Checklist */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-blue-800 text-lg">Trip Creation Process:</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <span className="text-blue-700">Get your trip intent and preferences</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <span className="text-blue-700">Generate personalized anchors for your destination</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <span className="text-blue-700">Build your complete itinerary</span>
                </div>
              </div>
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mt-4">
                <p className="text-blue-800 font-medium text-sm">
                  ⏱️ <strong>Takes about 5 minutes</strong> - We'll guide you through each step!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="space-y-6">
          <button
            onClick={() => navigate("/tripsetup")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            🚀 Ready to Begin!
          </button>

        </div>
      </div>
    </div>
  );
}
