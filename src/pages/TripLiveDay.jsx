import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import axios from "axios";

export default function TripLiveDay() {
  const navigate = useNavigate();
  const [tripId, setTripId] = useState(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [currentBlock, setCurrentBlock] = useState("morning"); // morning → afternoon → evening
  const [totalDays, setTotalDays] = useState(0);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const user = await new Promise(resolve => {
          const unsub = auth.onAuthStateChanged(u => {
            unsub();
            resolve(u);
          });
        });
        if (!user) {
          navigate("/access");
          return;
        }

        const token = await user.getIdToken();
        // hydrate trip
        const res = await axios.get("/tripwell/tripstatus", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { tripId, totalDays, currentDay, currentBlock } = res.data;
        setTripId(tripId);
        setTotalDays(totalDays);
        setCurrentDay(currentDay || 1);
        setCurrentBlock(currentBlock || "morning");
      } catch (err) {
        console.error("TripLiveDay hydrate error:", err);
        navigate("/access");
      }
    };

    hydrate();
  }, [navigate]);

  if (!tripId) return <div className="p-6">Loading trip...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Day {currentDay} of {totalDays}</h1>
      <p className="mt-2">Current block: {currentBlock}</p>
      <button
        onClick={() =>
          navigate("/tripliveblock", { state: { tripId, currentDay, currentBlock, totalDays } })
        }
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-xl"
      >
        🚀 Start {currentBlock}
      </button>
    </div>
  );
}
