import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import BACKEND_URL from "../config";
import { fetchJSON } from "../utils/fetchJSON";

export default function AnchorSelect() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [tripStatus, setTripStatus] = useState(null);
  const [anchors, setAnchors] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hydratePage();
  }, []);

  const hydratePage = async () => {
    try {
      // ✅ Wait until Firebase is ready with Promise
      const firebaseUser = await new Promise(resolve => {
        const unsubscribe = auth.onAuthStateChanged(user => {
          unsubscribe();
          resolve(user);
        });
      });

      if (!firebaseUser) {
        console.error("❌ No Firebase user after waiting");
        // Don't redirect immediately - let the user see the loading state
        setLoading(false);
        return;
      }

      const token = await firebaseUser.getIdToken();

             // Get user data
       console.log("🔍 Calling /whoami for AnchorSelect...");
       const whoRes = await fetchJSON(`${BACKEND_URL}/tripwell/whoami`, {
         headers: { Authorization: `Bearer ${token}` },
         cache: "no-store"
       });
       console.log("🔍 WHOAMI response:", whoRes);

       console.log("🔍 Calling /tripstatus for AnchorSelect...");
       const statusRes = await fetchJSON(`${BACKEND_URL}/tripwell/tripstatus`, {
         headers: { Authorization: `Bearer ${token}` },
         cache: "no-store"
       });
       console.log("🔍 TRIPSTATUS response:", statusRes);

       const user = whoRes.user;
       const status = statusRes.tripStatus;

       console.log("🔍 User:", user);
       console.log("🔍 Status:", status);

       if (!status.tripId || !user) {
         console.log("❌ Missing tripId or user, redirecting to /access");
         return navigate("/access");
       }

      if (!status.intentExists) {
        return navigate("/tripintent");
      }

      setUser(user);
      setTripStatus(status);

      // Hydrate saved selections (if any)
      const anchorLogicRes = await fetchJSON(`${BACKEND_URL}/tripwell/anchorlogic/${status.tripId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (anchorLogicRes?.anchorTitles) {
        setSelected(anchorLogicRes.anchorTitles);
      }

      const anchorGPTRes = await fetchJSON(`${BACKEND_URL}/tripwell/anchorgpt/${status.tripId}?userId=${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnchors(anchorGPTRes);
      setLoading(false);
    } catch (err) {
      console.error("❌ Anchor Select Load Error", err);
      navigate("/access");
    }
  };

  const toggleSelection = (title) => {
    setSelected((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const handleSubmit = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      
      const res = await fetch(`${BACKEND_URL}/tripwell/anchorselect/save/${tripStatus.tripId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user._id,
          anchorTitles: selected,
        }),
      });

      if (res.ok) {
        navigate(`/tripwell/itinerarybuild`);
      } else {
        console.error("❌ Submit Anchor Logic Failed", res.status);
      }
    } catch (err) {
      console.error("❌ Submit Anchor Logic Failed", err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Your Trip...</h1>
          <p className="text-gray-600 mb-6">Getting your anchor experiences ready</p>
        </div>
        
        <button
          onClick={() => navigate("/tripprebuild")}
          className="w-full bg-green-600 text-white px-5 py-3 rounded-md hover:bg-green-700 transition"
        >
          📍 Take Me Where I Left Off
        </button>
      </div>
    );
  }

  // If we're not loading but have no user, show a sign-in prompt
  if (!user) {
    return (
      <div className="p-6 max-w-xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to access your trip planning</p>
        </div>
        
        <button
          onClick={() => navigate("/access")}
          className="w-full bg-blue-600 text-white px-5 py-3 rounded-md hover:bg-blue-700 transition"
        >
          🔐 Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pick Your Anchors 🧭</h1>
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
