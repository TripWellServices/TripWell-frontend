import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTripContext } from "../context/TripContext";

const BACKEND_URL = "https://gofastbackend.onrender.com";

export default function ProfileSetup() {
  const { user, loading } = useTripContext();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [familySituation, setFamilySituation] = useState([]);
  const [travelStyle, setTravelStyle] = useState([]);
  const [tripVibe, setTripVibe] = useState([]);

  useEffect(() => {
    if (user) {
      setName(user.displayName || "");
      setEmail(user.email || "");
      setCity(user.city || "");
      setStateRegion(user.state || "");
    }
  }, [user]);

  const handleSubmit = async () => {
    try {
      const token = await user.firebaseToken; // if you’re storing it, or fetch from firebaseUser
      const res = await fetch(`${BACKEND_URL}/tripwell/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user._id,
          name,
          email,
          city,
          state: stateRegion,
          familySituation,
          travelStyle,
          tripVibe,
        }),
      });

      if (!res.ok) throw new Error("Profile update failed");

      navigate("/hub");
    } catch (err) {
      console.error("❌ Failed to save profile:", err);
      alert("Could not save profile.");
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading profile setup…</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Set Up Your Profile</h1>

      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full p-3 border rounded" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full p-3 border rounded" />
      <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="w-full p-3 border rounded" />
      <input value={stateRegion} onChange={(e) => setStateRegion(e.target.value)} placeholder="State/Region" className="w-full p-3 border rounded" />

      {/* You can use dropdowns or checkbox groups here */}
      {/* Placeholder array handling logic */}
      <input value={familySituation.join(", ")} onChange={(e) => setFamilySituation(e.target.value.split(",").map(s => s.trim()))} placeholder="Family Situation" className="w-full p-3 border rounded" />
      <input value={travelStyle.join(", ")} onChange={(e) => setTravelStyle(e.target.value.split(",").map(s => s.trim()))} placeholder="Travel Style" className="w-full p-3 border rounded" />
      <input value={tripVibe.join(", ")} onChange={(e) => setTripVibe(e.target.value.split(",").map(s => s.trim()))} placeholder="Trip Vibe" className="w-full p-3 border rounded" />

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition"
      >
        Save Profile
      </button>
    </div>
  );
}
