import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

export default function TripSetup() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tripName, setTripName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [city, setCity] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [codeStatus, setCodeStatus] = useState(null);
  const [codeValid, setCodeValid] = useState(false);
  const [partyCount, setPartyCount] = useState(1);
  const [whoWith, setWhoWith] = useState([]);
  const [loading, setLoading] = useState(true);

  const WHO_OPTIONS = [
    { label: "Spouse / Partner", value: "spouse" },
    { label: "Kids", value: "kids" },
    { label: "Friends", value: "friends" },
    { label: "Parents / Elders", value: "parents" },
    { label: "Multigenerational", value: "multigen" },
    { label: "Solo", value: "solo" },
    { label: "Other", value: "other" },
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/access");
        return;
      }

      try {
        const token = await firebaseUser.getIdToken();
        const headers = { Authorization: `Bearer ${token}` };

        // ✅ Step 1: Hydrate user
        const userRes = await fetch("https://gofastbackend.onrender.com/tripwell/whoami", { headers });
        if (!userRes.ok) {
          navigate("/access");
          return;
        }
        const userData = await userRes.json();
        if (!userData?._id && !userData?.userId) {
          navigate("/access");
          return;
        }
        setUser(userData);

        // ✅ Step 2: Check trip status
        const statusRes = await fetch("https://gofastbackend.onrender.com/tripwell/tripstatus", { headers });
        const statusData = await statusRes.json();
        if (statusData?.tripId) {
          navigate("/tripalreadycreated");
          return;
        }

      } catch (err) {
        console.error("❌ Setup hydration failed", err);
        navigate("/access");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [navigate]);

  const checkJoinCode = async () => {
    if (!joinCode || joinCode.trim().length < 3) {
      setCodeStatus({ msg: "⚠️ Please enter at least 3 characters.", color: "text-yellow-600" });
      setCodeValid(false);
      return;
    }

    try {
      const res = await fetch("https://gofastbackend.onrender.com/tripwell/joincodecheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode: joinCode.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.available) {
        setCodeStatus({ msg: "✅ Code is available!", color: "text-green-600" });
        setCodeValid(true);
      } else {
        setCodeStatus({ msg: "❌ Code already taken.", color: "text-red-600" });
        setCodeValid(false);
      }
    } catch (err) {
      console.error("Error checking code:", err);
      setCodeStatus({ msg: "⚠️ Error checking code.", color: "text-yellow-600" });
      setCodeValid(false);
    }
  };

  const handleSubmit = async () => {
    if (!codeValid) {
      alert("Please pick a valid, available join code before creating your trip.");
      return;
    }

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("https://gofastbackend.onrender.com/tripwell/tripbase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user._id || user.userId,
          tripName,
          purpose,
          startDate,
          endDate,
          city,
          joinCode,
          whoWith,
          partyCount,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json?.tripId) throw new Error("Trip creation failed");

      navigate(`/tripcreated/${json.tripId}`);
    } catch (err) {
      console.error("❌ Trip setup failed", err);
      alert("Could not save your trip. Please try again.");
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Set Up Your Trip</h1>

      <input
        value={tripName}
        onChange={(e) => setTripName(e.target.value)}
        placeholder="Trip Name"
        className="w-full p-3 border rounded"
      />
      <input
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
        placeholder="Purpose (e.g. Vacation)"
        className="w-full p-3 border rounded"
      />
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="w-full p-3 border rounded"
      />
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="w-full p-3 border rounded"
      />
      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="City or Destination"
        className="w-full p-3 border rounded"
      />

      <div className="flex items-center gap-2">
        <input
          value={joinCode}
          onChange={(e) => {
            setJoinCode(e.target.value);
            setCodeValid(false);
            setCodeStatus(null);
          }}
          placeholder="Join Code (required — like a username)"
          className="w-full p-3 border rounded"
        />
        <button
          type="button"
          onClick={checkJoinCode}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Check
        </button>
      </div>
      {codeStatus && <p className={`text-sm ${codeStatus.color}`}>{codeStatus.msg}</p>}

      <label className="font-semibold">Party Count</label>
      <input
        type="number"
        min={1}
        value={partyCount}
        onChange={(e) => setPartyCount(parseInt(e.target.value))}
        className="w-full p-3 border rounded"
      />

      <fieldset className="space-y-2">
        <legend className="font-semibold">Who are you traveling with?</legend>
        {WHO_OPTIONS.map((opt) => (
          <label key={opt.value} className="flex items-center space-x-2">
            <input
              type="checkbox"
              value={opt.value}
              checked={whoWith.includes(opt.value)}
              onChange={(e) => {
                if (e.target.checked) {
                  setWhoWith([...whoWith, opt.value]);
                } else {
                  setWhoWith(whoWith.filter((w) => w !== opt.value));
                }
              }}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </fieldset>

      <button
        onClick={handleSubmit}
        disabled={!codeValid}
        className={`py-3 px-6 rounded-lg transition ${
          codeValid
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Create Trip
      </button>
    </div>
  );
}
