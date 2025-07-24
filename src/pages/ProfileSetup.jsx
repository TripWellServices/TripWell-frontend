import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfileSetup() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [travelStyle, setTravelStyle] = useState([]);
  const [tripVibe, setTripVibe] = useState([]);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const res = await fetch("/tripwell/whoami");
        if (!res.ok) throw new Error("Failed to fetch identity");

        const data = await res.json();
        setUser(data);
        setEmail(data.email || "");
        setName(data.name || "");
      } catch (err) {
        console.error("❌ Failed to load user:", err);
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, []);

  const handleSubmit = async () => {
    try {
      const res = await fetch("/tripwell/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          name,
          email,
          city,
          state: stateRegion,
          travelStyle,
          tripVibe,
        }),
      });

      if (!res.ok) throw new Error("Profile update failed");

      navigate("/tripsetup");
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
      <input value={travelStyle.join(", ")} onChange={(e) => setTravelStyle(e.target.value.split(",").map(s => s.trim()))} placeholder="Travel Style (e.g., Laid-back, Adventurous)" className="w-full p-3 border rounded" />
      <input value={tripVibe.join(", ")} onChange={(e) => setTripVibe(e.target.value.split(",").map(s => s.trim()))} placeholder="Trip Vibe (e.g., Chill, Party, Cultural)" className="w-full p-3 border rounded" />

      <button onClick={handleSubmit} className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition">
        Save and Start Planning
      </button>
    </div>
  );
}
