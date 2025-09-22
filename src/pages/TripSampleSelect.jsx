// src/pages/TripPersonaSample.jsx - Persona Learning with Sample Selections
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BACKEND_URL from "../config";

export default function TripPersonaSample() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [samples, setSamples] = useState({
    attractions: [],
    restaurants: [],
    neatThings: []
  });
  const [selectedSamples, setSelectedSamples] = useState([]);
  const [tripData, setTripData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [tripPersona, setTripPersona] = useState(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadLocalData = () => {
      try {
        const user = JSON.parse(localStorage.getItem("userData") || "null");
        const trip = JSON.parse(localStorage.getItem("tripData") || "null");
        const persona = JSON.parse(localStorage.getItem("tripPersonaData") || "null");
        
        setUserData(user);
        setTripData(trip);
        setTripPersona(persona);
        
        console.log("🔍 Loaded localStorage data:", { user, trip, persona });
      } catch (err) {
        console.error("❌ Error loading localStorage data:", err);
      }
    };

    loadLocalData();
  }, []);

  // Fetch persona samples when component mounts
  useEffect(() => {
    if (tripData?.city && tripPersona) {
      fetchPersonaSamples();
    }
  }, [tripData, tripPersona]);

  const fetchPersonaSamples = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/tripwell/persona-samples`, {
        tripId: tripData.tripId || tripData._id,
        userId: userData.firebaseId,
        city: tripData.city,
        personas: tripPersona.personas,
        budget: tripPersona.budget,
        whoWith: tripPersona.whoWith
      });

      if (res.status === 200) {
        setSamples(res.data.samples || { attractions: [], restaurants: [], neatThings: [] });
        console.log("✅ Persona samples loaded:", res.data.samples);
      }
    } catch (err) {
      console.error("❌ Error fetching persona samples:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSampleSelection = (sampleId) => {
    setSelectedSamples(prev => 
      prev.includes(sampleId) 
        ? prev.filter(id => id !== sampleId)
        : [...prev, sampleId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send sample selections to backend for weight updates
      const res = await axios.post(`${BACKEND_URL}/tripwell/persona-sample-service`, {
        tripId: tripData.tripId || tripData._id,
        userId: userData.firebaseId,
        selectedSamples: selectedSamples,
        currentPersonas: tripPersona.personas
      });

      if (res.status === 200) {
        // Save updated persona to localStorage
        localStorage.setItem("tripPersonaData", JSON.stringify(res.data.updatedPersona));
        localStorage.setItem("selectedSamples", JSON.stringify(selectedSamples));
        console.log("💾 Updated persona weights:", res.data.updatedPersona);
        
      // Navigate to final itinerary generation
      navigate("/tripwell/itinerarybuild");
      }
    } catch (err) {
      console.error("❌ Error updating persona weights:", err);
    } finally {
      setLoading(false);
    }
  };

  // If no localStorage data, show error
  if (!userData || !tripData || !tripPersona) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Missing Data</h1>
          <p className="text-gray-600">Please start from the beginning.</p>
          <button 
            onClick={() => navigate("/")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-300 to-blue-200 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Here are some personalized recommendations for you
        </h1>
        
        <div className="bg-blue-50 p-6 rounded-xl mb-6 border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">Help us personalize your experience</h2>
          <p className="text-blue-700 leading-relaxed">
            Based on your preferences, we've curated some samples. Select the ones that appeal to you, and we'll use this feedback to fine-tune your personalized recommendations.
          </p>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading persona samples...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Attractions Section */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                🏛️ Attractions (2 samples)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {samples.attractions.map((attraction, index) => (
                  <label key={attraction.id || index} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedSamples.includes(attraction.id || index)}
                      onChange={() => toggleSampleSelection(attraction.id || index)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700">{attraction.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{attraction.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Restaurants Section */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                🍽️ Restaurants (2 samples)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {samples.restaurants.map((restaurant, index) => (
                  <label key={restaurant.id || index} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedSamples.includes(restaurant.id || index)}
                      onChange={() => toggleSampleSelection(restaurant.id || index)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700">{restaurant.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{restaurant.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Neat Things Section */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                ✨ Neat Things (2 samples)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {samples.neatThings.map((thing, index) => (
                  <label key={thing.id || index} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedSamples.includes(thing.id || index)}
                      onChange={() => toggleSampleSelection(thing.id || index)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700">{thing.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{thing.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-green-700 text-sm">
                <strong>Selected {selectedSamples.length} samples.</strong> 
                {selectedSamples.length > 0 && " We'll use this feedback to refine your persona weights."}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-lg transition text-lg font-semibold ${
                !loading
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? "Updating Persona..." : 'Build My Final Itinerary'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
