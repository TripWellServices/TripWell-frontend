import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const FunnelRouter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get demo data from location state if available
  const demoData = location.state?.demoData || {};

  const handleContinueToProfile = () => {
    // Navigate to profile setup with demo data
    navigate('/profileSetup', { 
      state: { 
        fromDemo: true,
        demoData: demoData 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Main Content */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Thanks for jumping full in! 🚀
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            We'll set up your profile and then drop you into your trip. 
            This will only take a minute and will help us personalize your experience.
          </p>

          {/* Demo Trip Preview (if available) */}
          {demoData.destination && (
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Your {demoData.numDays}-Day Trip to {demoData.destination}
              </h3>
              <p className="text-blue-700">
                We'll use what we know about your preferences to create a personalized experience.
              </p>
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={handleContinueToProfile}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Continue to Profile Setup
          </button>

          {/* Optional: Back to Demo */}
          <div className="mt-6">
            <button
              onClick={() => navigate('/demo')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← Back to Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunnelRouter;
