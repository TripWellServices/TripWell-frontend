// src/pages/TripReflectionsHub.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../firebase";
import BACKEND_URL from "../config";

export default function TripReflectionsHub() {
  const navigate = useNavigate();
  const [reflections, setReflections] = useState([]);
  const [city, setCity] = useState("");
  const [tripName, setTripName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReflections = async () => {
      try {
        console.log("🔍 TripReflectionsHub - Starting to load reflections...");
        
        // Get trip data from localStorage
        const tripData = JSON.parse(localStorage.getItem("tripData") || "null");
        console.log("🔍 TripReflectionsHub - tripData:", tripData);
        
        if (!tripData?.tripId) {
          console.error("❌ No trip data found");
          setLoading(false);
          return;
        }

        setCity(tripData.city || "");
        setTripName(tripData.tripName || "Your Trip");

        console.log("🔍 TripReflectionsHub - Waiting for Firebase auth...");
        // Wait for Firebase auth to be ready
        await new Promise(resolve => {
          const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe();
            resolve(user);
          });
        });

        const user = auth.currentUser;
        if (!user) {
          throw new Error("No authenticated user");
        }
        
        const token = await user.getIdToken();
        console.log("🔍 TripReflectionsHub - Got token, calling backend...");
        
        // 🔴 LOAD FROM BACKEND: Get all reflections for this trip
        const url = `${BACKEND_URL}/tripwell/reflections/${tripData.tripId}`;
        console.log("🔍 TripReflectionsHub - Calling URL:", url);
        
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("✅ Loaded reflections from backend:", res.data);
        setReflections(res.data);
        
      } catch (error) {
        console.error("❌ Error loading reflections:", error);
        console.error("❌ Error details:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    loadReflections();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading your trip memories...</div>;
  if (!reflections.length) return (
    <div className="max-w-2xl mx-auto p-8 text-center space-y-6">
      <h1 className="text-3xl font-bold">📓 Your Reflections</h1>
      <p className="text-gray-700 text-lg">No reflections found yet. Complete your trip to see your memories!</p>
      <button
        onClick={() => navigate("/")}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-lg"
      >
        🏠 Return Home
      </button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">✨ Memories from {tripName}</h1>
      <p className="text-center text-gray-600">Here's what made your time in {city} unforgettable.</p>

      <div className="bg-white shadow-md rounded-xl p-4 border">
        {reflections.map((ref, i) => (
          <div key={i} className="mb-6 border-t pt-4">
            <h3 className="text-lg font-bold">Day {ref.dayIndex}</h3>
            <p className="text-gray-800 font-medium mb-1">Summary: {ref.summary}</p>
            {ref.moodTags && ref.moodTags.length > 0 && (
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-semibold">Mood:</span> {ref.moodTags.join(", ")}
              </p>
            )}
            {ref.journalText && (
              <p className="text-gray-800 whitespace-pre-wrap">{ref.journalText}</p>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/")}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-lg"
      >
        🏠 Return Home
      </button>
    </div>
  );
}
