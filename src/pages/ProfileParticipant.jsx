import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserAndTrip } from "../services/userService";
import { getAuth } from "firebase/auth";

const BACKEND_URL = "https://gofastbackend.onrender.com";

export default function ProfileParticipant() {
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
        const { user, trip } = await getUserAndTrip();
        setUser(user);
        setName(user.name || user.displayName || "");
        setEmail(user.email || "");
        setCity(user.city || "");
        setStateRegion(user.state || "");
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
      const token = await getAuth().currentUser.getIdToken();

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
          travelStyle,
          tripVibe,
        }),
      });

      if (!res.ok) throw new Error("Profile update failed");

      navigate("/");
    } catch (err) {
      console.error("❌ Failed to save profile:", err);
      alert("Could not save your profile.");
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading your profile…</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">You're In!</h1>
      <p className="text-gray-600">
        Thanks for joining your travel companion's trip. Fill this out so they know who's coming and we can shape your trip better.
      </p>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="w-full p-3 border rounded"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full p-3 border rounded"
      />
      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="City"
        className="w-full p-3 border rounded"
      />
      <input
        value={stateRegion}
        onChange={(e) => setStateRegion(e.target.value)}
        placeholder="State/Region"
        className="w-full p-3 border rounded"
      />
      <input
        value={travelStyle.join(", ")}
        onChange={(e) =>
          setTravelStyle(e.target.value.split(",").map((s) => s.trim()))
        }
        placeholder="Travel Style (e.g., Chill, Adventurous)"
        className="w-full p-3 border rounded"
      />
      <input
        value={tripVibe.join(", ")}
        onChange={(e) =>
          setTripVibe(e.target.value.split(",").map((s) => s.trim()))
        }
        placeholder="Trip Vibe (e.g., Party, Culture)"
        className="w-full p-3 border rounded"
      />

      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition"
      >
        Save
      </button>
    </div>
  );
}
