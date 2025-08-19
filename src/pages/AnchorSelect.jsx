import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BACKEND_URL from "../config";
import { auth } from "../firebase";

export default function AnchorSelect() {
  const navigate = useNavigate();

  const [anchors, setAnchors] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [tripData, setTripData] = useState(null);
  const [tripIntentData, setTripIntentData] = useState(null);
  const [anchorSelectData, setAnchorSelectData] = useState(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadLocalData = () => {
      try {
        const user = JSON.parse(localStorage.getItem("userData") || "null");
        const trip = JSON.parse(localStorage.getItem("tripData") || "null");
        const intent = JSON.parse(localStorage.getItem("tripIntentData") || "null");
        const anchorsLocal = JSON.parse(localStorage.getItem("anchorSelectData") || "null");
        
        setUserData(user);
        setTripData(trip);
        setTripIntentData(intent);
        setAnchorSelectData(anchorsLocal);
        
        console.log("🔍 Loaded localStorage data:", { user, trip, intent, anchorsLocal });
      } catch (err) {
        console.error("❌ Error loading localStorage data:", err);
      }
    };

    loadLocalData();
  }, []);

  // Call anchor service when we have the data
  useEffect(() => {
    if (!userData || !tripData) return;

    // If anchors already exist in localStorage, skip loading/saving
    // and go straight to itinerary (overview if we already have one)
    if (anchorSelectData && Array.isArray(anchorSelectData.anchors) && anchorSelectData.anchors.length > 0) {
      console.log("✅ Anchors already exist in localStorage, skipping fetch and navigating to itinerary");
      const itineraryData = JSON.parse(localStorage.getItem("itineraryData") || "null");
      if (itineraryData && itineraryData.itineraryId) {
        navigate("/tripwell/itineraryupdate");
      } else {
        navigate("/tripwell/itinerarybuild");
      }
      return;
    }

    // Otherwise, verify with server first to avoid re-saving when DB already has anchors
    (async () => {
      try {
        const tripId = tripData.tripId || tripData._id;
        const token = await auth?.currentUser?.getIdToken();

        // 1) Check anchor selection status on the server
        const statusRes = await fetch(`${BACKEND_URL}/tripwell/anchorselect/status/${tripId}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store"
        });

        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData?.hasCompletedAnchorSelection) {
            const titles = Array.isArray(statusData.anchors)
              ? statusData.anchors.map((a) => a.title).filter(Boolean)
              : [];
            localStorage.setItem("anchorSelectData", JSON.stringify({ anchors: titles }));
            console.log("✅ Server reports anchors completed; saved to localStorage and redirecting");

            // 2) Prefer itinerary overview if itinerary already exists
            const itinStatusRes = await fetch(`${BACKEND_URL}/tripwell/itinerary/status/${tripId}`, {
              headers: { Authorization: `Bearer ${token}` },
              cache: "no-store"
            });

            if (itinStatusRes.ok) {
              const itin = await itinStatusRes.json();
              if (itin?.hasCompletedItinerary) {
                return navigate("/tripwell/itineraryupdate");
              }
            }

            return navigate("/tripwell/itinerarybuild");
          }
        }
      } catch (e) {
        console.warn("⚠️ Anchor status check failed, falling back to loading suggestions", e);
      }

      // If server says not completed, load fresh suggestions to pick
      loadAnchors();
    })();
  }, [userData, tripData, anchorSelectData, navigate]);

  const loadAnchors = async () => {
    try {
      console.log("🔍 Loading anchors with localStorage data...");
      
      const tripId = tripData.tripId || tripData._id;
      const userId = userData.firebaseId;
      
      const url = `${BACKEND_URL}/tripwell/anchorgpt/${tripId}?userId=${userId}`;
      console.log("🔍 Calling URL:", url);

      const token = await auth?.currentUser?.getIdToken();

      console.log("🔍 Token:", token);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          tripData: tripData,
          tripIntentData: tripIntentData
        })
      });
      
      console.log("🔍 Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Success! Got anchors:", data);
        setAnchors(data);
      } else {
        const errorText = await response.text();
        console.error("❌ Error response:", errorText);
        console.error("❌ Status:", response.status);
      }
      
    } catch (err) {
      console.error("❌ Failed to load anchors:", err);
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
      // If anchors already saved (from hydration/localflush), don't try to save again
      const existing = JSON.parse(localStorage.getItem("anchorSelectData") || "null");
      if (existing && Array.isArray(existing.anchors) && existing.anchors.length > 0) {
        console.log("✅ Anchors already saved; skipping save and going to itinerary");
        return navigate(`/tripwell/itinerarybuild`);
      }

      const token = await auth?.currentUser?.getIdToken();
      const tripId = tripData._id || tripData.tripId;
      const res = await fetch(`${BACKEND_URL}/tripwell/anchorselect/save/${tripId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
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
        const itineraryData = JSON.parse(localStorage.getItem("itineraryData") || "null");
        if (itineraryData && itineraryData.itineraryId) {
          navigate(`/tripwell/itineraryupdate`);
        } else {
          navigate(`/tripwell/itinerarybuild`);
        }
      } else {
        // Treat duplicate/exists as success and proceed
        const text = await res.text().catch(() => "");
        const isDuplicate = res.status === 409 || (res.status === 500 && /E11000|duplicate key/i.test(text));
        if (isDuplicate) {
          console.log("⚠️ Duplicate anchor save detected; proceeding to itinerary");
          const anchorSelectData = { anchors: selected };
          localStorage.setItem("anchorSelectData", JSON.stringify(anchorSelectData));
          const itineraryData = JSON.parse(localStorage.getItem("itineraryData") || "null");
          if (itineraryData && itineraryData.itineraryId) {
            return navigate(`/tripwell/itineraryupdate`);
          }
          return navigate(`/tripwell/itinerarybuild`);
        }
        console.error("❌ Submit Anchor Logic Failed", res.status, text);
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
          <h1 className="text-2xl font-bold mb-4">Loading Anchors...</h1>
          <p className="text-gray-600 mb-6">Getting your personalized experience suggestions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pick Your Anchors 🧭</h1>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <p className="text-sm text-blue-800">
          Your trip to <strong>{tripData.city}</strong>
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
