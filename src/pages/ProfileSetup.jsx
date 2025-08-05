import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

// Hardcoded backend URL so we bypass the frontend domain
const API_BASE = "https://gofastbackend.onrender.com";

export default function ProfileSetup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [hometownCity, setHometownCity] = useState("");
  const [state, setState] = useState("");
  const [travelStyle, setTravelStyle] = useState([]);
  const [tripVibe, setTripVibe] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const states = [
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
    "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
    "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
    "VA","WA","WV","WI","WY"
  ];

  useEffect(() => {
    const hydrateForm = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`${API_BASE}/tripwell/whoami`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error(`Hydration failed: ${res.status}`);
        const user = await res.json();

        setFirstName(user?.firstName || "");
        setLastName(user?.lastName || "");
        setEmail(user?.email || auth.currentUser?.email || "");
        setHometownCity(user?.hometownCity || "");
        setState(user?.state || "");
        setTravelStyle(Array.isArray(user?.travelStyle) ? user.travelStyle : []);
        setTripVibe(Array.isArray(user?.tripVibe) ? user.tripVibe : []);
      } catch (err) {
        console.error("Error hydrating user:", err);
        setEmail(auth.currentUser?.email || ""); // fallback
      } finally {
        setLoading(false);
      }
    };

    hydrateForm();
  }, []);

  const handleCheckboxChange = (value, setFn, current) => {
    if (current.includes(value)) {
      setFn(current.filter((v) => v !== value));
    } else {
      setFn([...current, value]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${API_BASE}/tripwell/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName,
          lastName,
          hometownCity,
          state,
          travelStyle,
          tripVibe
        })
      });

      if (!res.ok) throw new Error(`Profile update failed: ${res.status}`);
      const updated = await res.json();

      if (updated.role === "originator") {
        navigate("/tripsetup");
      } else {
        navigate("/pretrip"); {/* ✅ Changed to pretrip route because ro */}
      }
    } catch (err) {
      console.error("Error submitting profile:", err);
    }
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Let's finish setting up your profile</h2>

      <label>First Name</label>
      <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />

      <label>Last Name</label>
      <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />

      <label>Email</label>
      <input value={email} disabled />

      <label>City/State You Call Home (Where Launching From)</label>
      <input
        value={hometownCity}
        onChange={(e) => setHometownCity(e.target.value)}
        placeholder="City"
        required
      />

      <select value={state} onChange={(e) => setState(e.target.value)} required>
        <option value="">State</option>
        {states.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <fieldset>
        <legend>Travel Style</legend>
        {["Luxury", "Budget", "Spontaneous", "Planned"].map((style) => (
          <label key={style}>
            <input
              type="checkbox"
              checked={travelStyle.includes(style)}
              onChange={() => handleCheckboxChange(style, setTravelStyle, travelStyle)}
            />
            {style}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Trip Vibe</legend>
        {["Chill", "Adventure", "Party", "Culture"].map((vibe) => (
          <label key={vibe}>
            <input
              type="checkbox"
              checked={tripVibe.includes(vibe)}
              onChange={() => handleCheckboxChange(vibe, setTripVibe, tripVibe)}
            />
            {vibe}
          </label>
        ))}
      </fieldset>

      <button type="submit">Save Profile</button>
    </form>
  );
}
