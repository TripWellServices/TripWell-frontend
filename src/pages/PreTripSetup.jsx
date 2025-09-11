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
    
    if (!userData?.profileComplete) {
      console.log("❌ Profile not complete, navigating to /profilesetup");
      navigate("/profilesetup");
      return;
    }
    
    console.log("✅ User authenticated and profile complete, showing PreTripSetup");
    setUser(userData);
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h1 className="text-2xl font-bold text-gray-800">Checking your setup...</h1>
          <p className="text-gray-600">Verifying your profile and authentication</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
        {/* Header Section */}
        <div className="space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L12 21L16 22V20.5L14 19V13.5L22 16Z"/>
            </svg>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Ready to Create Magic? ✨
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              We'll walk you through creating your trip step-by-step. This is where the magic happens - 
              <span className="font-semibold text-blue-700"> you'll give your trip a name, set the dates, and tell us what makes it special.</span>
            </p>
            <p className="text-base text-gray-500">
              The more details you share, the better your AI trip planner can craft the perfect experience for you and your travel companions.
            </p>
          </div>
        </div>

        {/* Action Section */}
        <div className="space-y-6">
          <button
            onClick={() => navigate("/tripsetup")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            🎨 Let's Create My Trip!
          </button>

          <p className="text-gray-600 text-sm">
            Not ready yet?{" "}
            <button
              onClick={() => navigate("/postprofileroleselect")}
              className="underline text-blue-600 hover:text-blue-700 font-medium"
            >
              Go back to choose again
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
