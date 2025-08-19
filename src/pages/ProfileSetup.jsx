import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import BACKEND_URL from "../config";

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
        const res = await fetch(`${BACKEND_URL}/tripwell/whoami`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store"
        });

        if (!res.ok) throw new Error(`Hydration failed: ${res.status}`);
        const { user } = await res.json();

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
      const res = await fetch(`${BACKEND_URL}/tripwell/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          hometownCity,
          state,
          travelStyle,
          tripVibe
        })
      });

      if (!res.ok) throw new Error(`Profile update failed: ${res.status}`);

      // Save updated user data to localStorage
      const updatedUserData = {
        firebaseId: auth.currentUser.uid,
        email: email,
        firstName: firstName,
        lastName: lastName,
        hometownCity: hometownCity,
        state: state,
        profileComplete: true
      };
      localStorage.setItem("userData", JSON.stringify(updatedUserData));
      localStorage.setItem("profileComplete", "true");
      console.log("💾 Updated userData and set profileComplete to true:", updatedUserData);

      // ✅ Always send to TripSetup after saving profile
      navigate("/tripsetup");
    } catch (err) {
      console.error("Error submitting profile:", err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-600 text-lg">Loading profile…</div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Let's finish setting up your profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="font-semibold">First Name</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full p-3 border rounded"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="font-semibold">Last Name</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full p-3 border rounded"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="font-semibold">Email</label>
          <input value={email} disabled className="w-full p-3 border rounded bg-gray-100 text-gray-600" />
        </div>

        <div className="space-y-2">
          <label className="font-semibold">City/State You Call Home (Where Launching From)</label>
          <input
            value={hometownCity}
            onChange={(e) => setHometownCity(e.target.value)}
            placeholder="City"
            className="w-full p-3 border rounded"
            required
          />
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full p-3 border rounded"
            required
          >
            <option value="">State</option>
            {states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <fieldset className="space-y-2">
          <legend className="font-semibold">Travel Style</legend>
          {["Luxury", "Budget", "Spontaneous", "Planned"].map((style) => (
            <label key={style} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={travelStyle.includes(style)}
                onChange={() => handleCheckboxChange(style, setTravelStyle, travelStyle)}
              />
              <span>{style}</span>
            </label>
          ))}
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="font-semibold">Trip Vibe</legend>
          {["Chill", "Adventure", "Party", "Culture"].map((vibe) => (
            <label key={vibe} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={tripVibe.includes(vibe)}
                onChange={() => handleCheckboxChange(vibe, setTripVibe, tripVibe)}
              />
              <span>{vibe}</span>
            </label>
          ))}
        </fieldset>

        <button
          type="submit"
          className="w-full p-3 rounded font-medium bg-blue-600 text-white hover:bg-blue-700"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
}
