import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

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
  }, [tripId]);

  const hydratePage = async () => {
    try {
      const whoRes = await axios.get("/tripwell/whoami", { withCredentials: true });
      const statusRes = await axios.get("/tripwell/tripstatus", { withCredentials: true });

      const user = whoRes.data.user;
      const status = statusRes.data.tripStatus;

      if (!status.tripId || !user || user.role !== "originator") {
        return navigate("/tripwell/tripitineraryrequired");
      }

      if (!status.intentExists) {
        return navigate("/tripwell/tripintentrequired");
      }

      setUser(user);
      setTripStatus(status);

      // Hydrate saved selections (if any)
      const anchorLogicRes = await axios.get(`/tripwell/anchorlogic/${status.tripId}`);
      if (anchorLogicRes.data?.anchorTitles) {
        setSelected(anchorLogicRes.data.anchorTitles);
      }

      const anchorGPTRes = await axios.get(`/tripwell/anchorgpt/${status.tripId}?userId=${user._id}`);
      setAnchors(anchorGPTRes.data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Anchor Select Load Error", err);
      navigate("/tripwell/tripitineraryrequired");
    }
  };

  const toggleSelection = (title) => {
    setSelected((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const handleSubmit = async () => {
    try {
      await axios.post(
        `/tripwell/anchorselect/save/${tripId}`,
        {
          userId: user._id,
          anchorTitles: selected,
        },
        { withCredentials: true }
      );
      navigate(`/tripwell/itinerary/${tripId}`);
    } catch (err) {
      console.error("❌ Submit Anchor Logic Failed", err);
    }
  };

  if (loading) return <div className="p-6">Loading anchors...</div>;

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
