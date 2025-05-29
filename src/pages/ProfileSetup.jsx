import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuth } from "firebase/auth";

export default function ProfileSetup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [familySituation, setFamilySituation] = useState([]);
  const [travelStyle, setTravelStyle] = useState([]);
  const [tripVibe, setTripVibe] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      setName(user.displayName || "");
      setEmail(user.email || "");
    }
  }, []);

  const toggleCheckbox = (value, setFn, current) => {
    if (current.includes(value)) {
      setFn(current.filter((v) => v !== value));
    } else {
      setFn([...current, value]);
    }
  };

  const handleSubmit = async () => {
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();

      const payload = {
        name,
        email,
        location: `${city}, ${state}`,
        familySituation,
        travelStyle,
        tripVibe
      };

      await axios.post("/api/users/profile/setup", payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("✅ Profile saved!");
      navigate("/hub");
    } catch (err) {
      console.error("❌ Profile setup failed", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Tell us about you</h2>

      <input
        className="w-full border p-2 mb-3 rounded"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="w-full border p-2 mb-3 rounded bg-gray-100"
        placeholder="Email"
        value={email}
        readOnly
      />
      <div className="flex space-x-2 mb-3">
        <input
          className="w-1/2 border p-2 rounded"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          className="w-1/2 border p-2 rounded"
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-1">Your Family Situation</h3>
        {[
          "I'm a parent",
          "Married/partnered",
          "Young kids",
          "Teens",
          "Travel solo",
          "Extended family",
          "Friends trips"
        ].map((opt) => (
          <label key={opt} className="block">
            <input
              type="checkbox"
              checked={familySituation.includes(opt)}
              onChange={() => toggleCheckbox(opt, setFamilySituation, familySituation)}
            />
            <span className="ml-2">{opt}</span>
          </label>
        ))}
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-1">Your Travel Style</h3>
        {[
          "Planner",
          "Spontaneous",
          "Chill trips",
          "High energy trips",
          "Guided tours",
          "DIY travel",
          "Pack light",
          "Overprepare"
        ].map((opt) => (
          <label key={opt} className="block">
            <input
              type="checkbox"
              checked={travelStyle.includes(opt)}
              onChange={() => toggleCheckbox(opt, setTravelStyle, travelStyle)}
            />
            <span className="ml-2">{opt}</span>
          </label>
        ))}
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-1">What Do You Want Most From Trips?</h3>
        {[
          "Culture",
          "Food",
          "History",
          "Relaxation",
          "Bonding time",
          "Nature",
          "Adventure",
          "Nightlife",
          "Fitness / Staying active"
        ].map((opt) => (
          <label key={opt} className="block">
            <input
              type="checkbox"
              checked={tripVibe.includes(opt)}
              onChange={() => toggleCheckbox(opt, setTripVibe, tripVibe)}
            />
            <span className="ml-2">{opt}</span>
          </label>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        Save and Continue
      </button>
    </div>
  );
}
