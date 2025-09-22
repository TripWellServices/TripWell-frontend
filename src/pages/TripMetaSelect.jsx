// src/pages/TripMetaSelect.jsx - Meta Attraction Selection
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BACKEND_URL from "../config";

export default function TripMetaSelect() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [metaAttractions, setMetaAttractions] = useState([]);
  const [selectedMetas, setSelectedMetas] = useState([]);
  const [tripData, setTripData] = useState(null);
  const [userData, setUserData] = useState(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadLocalData = () => {
      try {
        const user = JSON.parse(localStorage.getItem("userData") || "null");
        const trip = JSON.parse(localStorage.getItem("tripData") || "null");
        
        setUserData(user);
        setTripData(trip);
        
        console.log("🔍 Loaded localStorage data:", { user, trip });
      } catch (err) {
        console.error("❌ Error loading localStorage data:", err);
      }
    };

    loadLocalData();
  }, []);

  // Fetch meta attractions when component mounts
  useEffect(() => {
    if (tripData?.city) {
      fetchMetaAttractions();
    }
  }, [tripData]);

  const fetchMetaAttractions = async () => {
    setLoading(true);
    try {
      // Fast lookup using cityId and season
      const cityId = tripData.cityId || tripData.tripId; // Use cityId if available, fallback to tripId
      const season = tripData.season || "any";
      
      console.log("🎯 Fast meta lookup for:", { cityId, season });
      
      const res = await axios.get(`${BACKEND_URL}/tripwell/meta-attractions/${cityId}/${season}`);

      if (res.status === 200) {
        setMetaAttractions(res.data.metaAttractions || []);
        console.log("✅ Meta attractions loaded:", res.data.metaAttractions);
      }
    } catch (err) {
      console.error("❌ Error fetching meta attractions:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMetaSelection = (metaName) => {
    setSelectedMetas(prev => 
      prev.includes(metaName) 
        ? prev.filter(name => name !== metaName)
        : [...prev, metaName]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save selected metas to localStorage
      localStorage.setItem("selectedMetas", JSON.stringify(selectedMetas));
      console.log("💾 Saved selected metas:", selectedMetas);
      
      // Navigate to next step (Persona Learning)
      navigate("/persona-sample");
    } catch (err) {
      console.error("❌ Error saving meta selections:", err);
    } finally {
      setLoading(false);
    }
  };

  // If no localStorage data, show error
  if (!userData || !tripData) {
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
          Hey bro - we know you're going to <strong>{tripData?.city || "Your Destination"}</strong>
        </h1>
        
        <div className="bg-blue-50 p-6 rounded-xl mb-6 border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">Just pick what you want to do there</h2>
          <p className="text-blue-700 leading-relaxed">
            These are the obvious, touristy attractions that everyone goes to. Select the ones you actually want to include in your trip, and we'll build the rest around your preferences.
          </p>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading meta attractions...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                🏛️ Select the "must-do" attractions you want to include
              </h2>
              <p className="text-gray-600 mb-6">
                Choose the obvious tourist attractions you actually want to visit
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metaAttractions.map((attraction, index) => (
                  <label key={index} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedMetas.includes(attraction.name)}
                      onChange={() => toggleMetaSelection(attraction.name)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700">{attraction.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{attraction.type}</div>
                      <div className="text-xs text-gray-400 mt-1">{attraction.reason}</div>
                    </div>
                  </label>
                ))}
              </div>
              
              {metaAttractions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No meta attractions found for this city.</p>
                  <button 
                    type="button"
                    onClick={fetchMetaAttractions}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-green-700 text-sm">
                <strong>Selected {selectedMetas.length} attractions.</strong> 
                {selectedMetas.length > 0 && " We'll integrate these into your personalized itinerary."}
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
              {loading ? "Saving..." : 'Continue to Persona Learning'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
