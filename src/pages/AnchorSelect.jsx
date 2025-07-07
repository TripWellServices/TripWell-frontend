import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const AnchorSelect = () => {
  const { tripId } = useParams();
  const [userId, setUserId] = useState(null);
  const [anchors, setAnchors] = useState([]);
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndAnchors = async () => {
      try {
        const whoami = await axios.get("https://gofastbackend.onrender.com/tripwell/whoami", {
          withCredentials: true,
        });

        const { user, trip } = whoami.data;

        // 🛑 Fallback if no trip or user
        if (!trip || !trip._id || !user || !user._id) {
          return navigate("/tripwell/tripnotcreated");
        }

        setUserId(user._id);

        // 🧠 Fallback if tripIntent not completed
        if (!user.tripIntentId) {
          return navigate("/tripwell/intentrequired");
        }

        // 🎯 Fetch anchors
        const res = await axios.get(
          `https://gofastbackend.onrender.com/tripwell/anchorgpt/${trip._id}?userId=${user._id}`
        );

        setAnchors(res.data);
      } catch (err) {
        console.error("Error fetching anchor data:", err);
        navigate("/tripwell/tripnotcreated"); // soft fallback
      }
    };

    fetchUserAndAnchors();
  }, [tripId, navigate]);

  const toggleSelection = (title) => {
    setSelected((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const handleSubmit = async () => {
    try {
      await axios.post(
        `https://gofastbackend.onrender.com/tripwell/anchorselect/save/${tripId}`,
        {
          userId,
          anchorTitles: selected,
        }
      );
      navigate(`/tripwell/itinerary/${tripId}`);
    } catch (err) {
      console.error("Error submitting anchor selections:", err);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pick Your Anchors 🧭</h1>
      <p className="mb-6">
        These are curated experience ideas based on your trip. Tap the ones that speak to you.
        Think of them as the main characters of your journey.
      </p>
      <div className="space-y-4">
        {anchors.map((anchor, idx) => (
          <div
            key={idx}
            className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
              selected.includes(anchor.title)
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300"
            }`}
            onClick={() => toggleSelection(anchor.title)}
          >
            <div className="text-lg font-semibold flex items-center justify-between">
              <span>{anchor.title}</span>
              <span className="text-2xl">{selected.includes(anchor.title) ? "✅" : "🤔"}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{anchor.description}</p>
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
};

export default AnchorSelect;
