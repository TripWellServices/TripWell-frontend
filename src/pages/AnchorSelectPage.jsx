// src/pages/AnchorSelectPage.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function AnchorSelectPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [userId, setUserId] = useState(null);
  const [anchorOptions, setAnchorOptions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Firebase UID from /whoami
  useEffect(() => {
    async function fetchUser() {
      try {
        const { data } = await axios.get("/tripwell/whoami");
        setUserId(data.userId);
      } catch (err) {
        console.error("❌ Error getting userId:", err);
      }
    }
    fetchUser();
  }, []);

  // 🧠 Auto-hydrate anchor suggestions from GPT
  useEffect(() => {
    if (!userId || !tripId) return;
    async function fetchAnchors() {
      try {
        const { data } = await axios.get(`/tripwell/anchorgpt/${tripId}?userId=${userId}`);
        setAnchorOptions(data.anchors || []);
        setLoading(false);
      } catch (err) {
        console.error("❌ Failed to get anchor suggestions:", err);
      }
    }
    fetchAnchors();
  }, [userId, tripId]);

  // 📝 Handle checkbox toggle
  function toggleSelect(anchorText) {
    setSelected((prev) =>
      prev.includes(anchorText)
        ? prev.filter((a) => a !== anchorText)
        : [...prev, anchorText]
    );
  }

  // 📬 Submit selected anchors to backend
  async function handleSubmit() {
    try {
      await axios.post(`/tripwell/anchorselects/${tripId}`, {
        userId,
        selectedAnchors: selected,
      });
      navigate(`/tripwell/itinerary/${tripId}`); // or whatever’s next
    } catch (err) {
      console.error("❌ Error saving selections:", err);
    }
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Thanks for submitting your preferences!</h2>
      <p>We've selected 5 experiences you may like. Pick the ones that most appeal to you and we'll use them to shape your itinerary.</p>

      {loading ? (
        <p>Loading suggestions...</p>
      ) : (
        <div>
          {anchorOptions.map((anchor, i) => (
            <div key={i} style={{ margin: "1rem 0", border: "1px solid #ccc", padding: "1rem" }}>
              <label>
                <input
                  type="checkbox"
                  checked={selected.includes(anchor.title)}
                  onChange={() => toggleSelect(anchor.title)}
                />
                <strong style={{ marginLeft: "0.5rem" }}>{anchor.title}</strong>
              </label>
              <p style={{ marginTop: "0.5rem" }}>{anchor.description}</p>
              {anchor.followOns?.length > 0 && (
                <ul>
                  {anchor.followOns.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      <button onClick={handleSubmit} disabled={selected.length === 0} style={{ marginTop: "2rem" }}>
        Submit & Continue
      </button>
    </div>
  );
}