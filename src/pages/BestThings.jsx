import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import axios from 'axios';

const BestThings = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    destination: '',
    interests: '',
    travelStyle: [],
    tripVibe: []
  });
  const [loading, setLoading] = useState(false);
  const [bestThings, setBestThings] = useState(null);
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
    
    if (!user) {
      setShowAuth(true);
      return;
    }

    setLoading(true);
    try {
      const token = await user.getIdToken();
      
      // Create a temporary trip for demo purposes
      const tripData = {
        tripName: `Best Things in ${formData.destination}`,
        purpose: 'Demo - Top things to do',
        city: formData.destination,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        joinCode: `BEST_${Date.now()}`,
        partyCount: 1,
        whoWith: ['solo']
      };

      // Create the trip
      const tripResponse = await axios.post(
        'https://gofastbackend.onrender.com/tripwell/trip-setup',
        tripData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const tripId = tripResponse.data.tripId;

      // Create trip intent with user interests
      const intentData = {
        priorities: formData.interests.split(',').map(a => a.trim()),
        vibes: formData.tripVibe,
        mobility: ['walking', 'public-transit'],
        travelPace: ['moderate'],
        budget: 'medium'
      };

      await axios.post(
        'https://gofastbackend.onrender.com/tripwell/tripintent',
        intentData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Generate anchors (these will be the "best things")
      const anchorResponse = await axios.post(
        `https://gofastbackend.onrender.com/tripwell/anchorgpt/${tripId}`,
        {
          tripData: {
            city: formData.destination,
            season: 'Spring'
          },
          tripIntentData: intentData
        }
      );

      // Format the best things data
      const formattedBestThings = anchorResponse.data.anchors.map((anchor, index) => ({
        id: index + 1,
        title: anchor,
        description: `A must-visit experience in ${formData.destination}`,
        category: index < 2 ? 'Top Attraction' : 'Hidden Gem',
        rating: (4.5 - index * 0.1).toFixed(1)
      }));

      setBestThings({
        destination: formData.destination,
        things: formattedBestThings
      });
      setLoading(false);

    } catch (error) {
      console.error('Best things generation failed:', error);
      setLoading(false);
      alert('Something went wrong. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new auth.GoogleAuthProvider();
      const result = await auth.signInWithPopup(provider);
      setUser(result.user);
      setShowAuth(false);
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
              Your top things are ready! 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              For your security, and in case you want to save them later, connect with Gmail to view.
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

  if (bestThings) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Top Things to Do in {bestThings.destination}
            </h1>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {bestThings.things.map((thing) => (
                <div key={thing.id} className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-500">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {thing.title}
                    </h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                      {thing.category}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{thing.description}</p>
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(parseFloat(thing.rating)) ? 'fill-current' : 'fill-gray-300'}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{thing.rating}/5</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                🎯 Want the full TripWell experience?
              </h3>
              <p className="text-blue-800 mb-4">
                Get a complete day-by-day itinerary with these attractions, plus live guidance during your trip!
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate('/')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Create Full Trip
                </button>
                <button
                  onClick={() => {
                    setBestThings(null);
                    setFormData({
                      destination: '',
                      interests: '',
                      travelStyle: [],
                      tripVibe: []
                    });
                  }}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Try Another City
                </button>
              </div>
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
            Find the Best Things to Do
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            Already have a trip planned? Let us show you the top things to do, hidden gems, and local recommendations for your destination.
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
                What interests you? (comma-separated)
              </label>
              <input
                type="text"
                name="interests"
                value={formData.interests}
                onChange={handleInputChange}
                placeholder="e.g., food, culture, museums, shopping, nature"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Travel Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {travelStyles.map(style => (
                  <label key={style} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.travelStyle.includes(style)}
                      onChange={() => handleCheckboxChange('travelStyle', style)}
                      className="mr-2"
                    />
                    {style}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trip Vibe
              </label>
              <div className="grid grid-cols-2 gap-2">
                {tripVibes.map(vibe => (
                  <label key={vibe} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.tripVibe.includes(vibe)}
                      onChange={() => handleCheckboxChange('tripVibe', vibe)}
                      className="mr-2"
                    />
                    {vibe}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Finding Best Things...' : 'Get Top Things to Do'}
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

export default BestThings;
