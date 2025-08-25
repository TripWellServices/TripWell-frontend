import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import axios from 'axios';

const ItineraryDemo = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    destination: '',
    season: '',
    numDays: 3,
    tripGoals: []
  });
  const [itineraryDataDemo, setItineraryDataDemo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);

  const travelStyles = ['Luxury', 'Budget', 'Spontaneous', 'Planned'];
  const tripVibes = ['Chill', 'Adventure', 'Party', 'Culture'];

  useEffect(() => {
    // Check if user is already authenticated
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (type, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Step 1: Generate demo itinerary (no auth required)
      const demoResponse = await axios.post(
        'https://gofastbackend.onrender.com/tripwell/demo/generate',
        {
          destination: formData.destination,
          season: formData.season,
          numDays: formData.numDays,
          tripGoals: formData.tripGoals
        }
      );
      
      setItineraryDataDemo(demoResponse.data.itineraryDataDemo);
      
      // Step 2: Show auth prompt
      setShowAuth(true);
      setLoading(false);
      
    } catch (error) {
      console.error('Demo generation failed:', error);
      setLoading(false);
      alert('Something went wrong. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new auth.GoogleAuthProvider();
      const result = await auth.signInWithPopup(provider);
      setUser(result.user);
      
      // Step 3: Create user and save demo trip
      const token = await result.user.getIdToken();
      
      // Create or find user with funnel stage (using normal TripWellUser route)
      await axios.post(
        'https://gofastbackend.onrender.com/tripwell/user/createOrFind',
        {
          firebaseId: result.user.uid,
          email: result.user.email,
          funnelStage: "itinerary_demo"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Save demo trip with itinerary data (no auth needed)
      const tripResponse = await axios.post(
        'https://gofastbackend.onrender.com/tripwell/demo/save',
        {
          itineraryDataDemo: itineraryDataDemo,
          firebaseId: result.user.uid,
          email: result.user.email
        }
      );
      
      setShowAuth(false);
      setItinerary(itineraryDataDemo); // Show the demo itinerary
      
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your custom itinerary is ready! 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              For your security, and in case you want to view it later, connect with Gmail to view.
            </p>
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (itinerary) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Your Demo Itinerary for {formData.destination}
            </h1>
            
                         {itinerary.days && itinerary.days.map((day, index) => (
               <div key={index} className="mb-8 p-6 bg-gray-50 rounded-lg">
                 <h3 className="text-xl font-semibold text-gray-900 mb-4">
                   {day.summary}
                 </h3>
                 <div className="space-y-4">
                   {day.activities && day.activities.map((activity, actIndex) => (
                     <div key={actIndex} className="bg-white p-4 rounded border">
                       <h4 className="font-semibold text-gray-800 capitalize mb-2">
                         {activity.time}
                       </h4>
                       <p className="text-gray-600">{activity.title}</p>
                       <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                     </div>
                   ))}
                 </div>
               </div>
             ))}

                         <div className="flex space-x-4">
               <button
                 onClick={() => navigate('/funnel-router', { 
                   state: { demoData: formData } 
                 })}
                 className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
               >
                 🚀 Want to personalize this trip and experience the full app? Click Continue.
               </button>
               <button
                 onClick={() => {
                   setItinerary(null);
                   setFormData({
                     destination: '',
                     season: '',
                     numDays: 3,
                     tripGoals: []
                   });
                 }}
                 className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
               >
                 Try Another Demo
               </button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Try TripWell's AI Magic
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            Enter your destination and preferences, and see how we create a personalized itinerary just for you.
          </p>

                     <form onSubmit={handleSubmit} className="space-y-6">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Destination
               </label>
               <input
                 type="text"
                 name="destination"
                 value={formData.destination}
                 onChange={handleInputChange}
                 placeholder="e.g., Paris, Tokyo, New York"
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                 required
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Season
               </label>
               <select
                 name="season"
                 value={formData.season}
                 onChange={handleInputChange}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                 required
               >
                 <option value="">Select a season</option>
                 <option value="Spring">Spring</option>
                 <option value="Summer">Summer</option>
                 <option value="Fall">Fall</option>
                 <option value="Winter">Winter</option>
               </select>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Number of Days
               </label>
               <input
                 type="number"
                 name="numDays"
                 value={formData.numDays}
                 onChange={handleInputChange}
                 min="1"
                 max="30"
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                 required
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Trip Goals (optional)
               </label>
               <div className="grid grid-cols-2 gap-2">
                 {['culture', 'food', 'adventure', 'relaxation', 'shopping', 'history'].map(goal => (
                   <label key={goal} className="flex items-center">
                     <input
                       type="checkbox"
                       checked={formData.tripGoals.includes(goal)}
                       onChange={() => handleCheckboxChange('tripGoals', goal)}
                       className="mr-2"
                     />
                     {goal.charAt(0).toUpperCase() + goal.slice(1)}
                   </label>
                 ))}
               </div>
             </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Generating Your Itinerary...' : 'Generate Demo Itinerary'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryDemo;
