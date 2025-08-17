import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import BACKEND_URL from "../config";

export default function AnchorSelect() {
  const navigate = useNavigate();

  const [anchors, setAnchors] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [tripData, setTripData] = useState(null);
  const [tripIntentData, setTripIntentData] = useState(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadLocalData = () => {
      try {
        const user = JSON.parse(localStorage.getItem("userData") || "null");
        const trip = JSON.parse(localStorage.getItem("tripData") || "null");
        const intent = JSON.parse(localStorage.getItem("tripIntentData") || "null");
        
        setUserData(user);
        setTripData(trip);
        setTripIntentData(intent);
        
        console.log("🔍 Loaded localStorage data:", { user, trip, intent });
      } catch (err) {
        console.error("❌ Error loading localStorage data:", err);
      }
    };

    loadLocalData();
  }, []);

        // Call anchor service when we have the data
   useEffect(() => {
     if (userData && tripData) {
       loadAnchors();
     }
   }, [userData, tripData]);

      const loadAnchors = async () => {
     try {
       console.log("🧪 Loading anchors from localStorage data...");
       console.log("🧪 TripId:", tripData.tripId);
       console.log("🧪 UserId:", userData.firebaseId);
       
       // Call the service directly - no auth needed since we're using localStorage
       const url = `${BACKEND_URL}/tripwell/anchorgpt/${tripData.tripId}?userId=${userData.firebaseId}`;
       console.log("🧪 Calling URL:", url);
       
       const response = await fetch(url);
      
      console.log("🧪 Response status:", response.status);
      
             if (response.ok) {
         const data = await response.json();
         console.log("🧪 Success! Data:", data);
         setAnchors(data);
       } else {
         const errorText = await response.text();
         console.error("🧪 Error response:", errorText);
         console.error("🧪 Status:", response.status);
       }
      
    } catch (err) {
      console.error("🧪 Test failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (title) => {
    setSelected((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

        const handleSubmit = async () => {
     try {
       const res = await fetch(`${BACKEND_URL}/tripwell/anchorselect/save/${tripData.tripId}`, {
         method: "POST",
         headers: {
           "Content-Type": "application/json"
         },
        body: JSON.stringify({
          userId: userData.firebaseId,
          anchorTitles: selected,
        }),
      });

      if (res.ok) {
        const anchorSelectData = { anchors: selected };
        localStorage.setItem("anchorSelectData", JSON.stringify(anchorSelectData));
        console.log("💾 Saved anchorSelectData to localStorage:", anchorSelectData);
        navigate(`/tripwell/itinerarybuild`);
      } else {
        console.error("❌ Submit Anchor Logic Failed", res.status);
      }
    } catch (err) {
      console.error("❌ Submit Anchor Logic Failed", err);
    }
  };

  // If no localStorage data, show error
  if (!userData || !tripData || !tripIntentData) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Missing Data</h1>
          <p className="text-gray-600">Please start from the beginning.</p>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-500">Debug info:</p>
            <p className="text-xs text-gray-400">userData: {userData ? '✅' : '❌'}</p>
            <p className="text-xs text-gray-400">tripData: {tripData ? '✅' : '❌'}</p>
            <p className="text-xs text-gray-400">tripIntentData: {tripIntentData ? '✅' : '❌'}</p>
          </div>
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

  if (loading) {
    return (
      <div className="p-6 max-w-xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Testing Anchor Service...</h1>
          <p className="text-gray-600 mb-6">Checking if the backend route works</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pick Your Anchors 🧭</h1>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <p className="text-sm text-blue-800">
          Planning: <strong>{tripData.tripName}</strong> to <strong>{tripData.city}</strong>
        </p>
      </div>
      
      <p className="mb-6">
        These are curated experience ideas based on your trip. Check the ones that speak to you.
        Think of them as the main characters of your journey.
      </p>

      <div className="space-y-4">
        {anchors.map((anchor, idx) => (
          <div
            key={idx}
            className="border rounded-xl p-4 transition-all duration-200 bg-white"
          >
            <div className="text-lg font-semibold mb-2">{anchor.title}</div>
            <p className="text-sm text-gray-600 mb-4">{anchor.description}</p>

            <div className="flex items-center gap-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selected.includes(anchor.title)}
                  onChange={() => toggleSelection(anchor.title)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded"
                />
                <span>❤️ Love this!</span>
              </label>

              <label className="flex items-center space-x-2 text-gray-400">
                <input
                  type="checkbox"
                  checked={!selected.includes(anchor.title)}
                  disabled
                  className="w-5 h-5 border-gray-300 rounded"
                />
                <span>⭕ Not a Fan</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all"
      >
        Lock In My Picks & Build My Trip 🧠
      </button>
    </div>
  );
}
