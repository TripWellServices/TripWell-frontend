import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TripLiveDay() {
  const [tripData, setTripData] = useState(null);
  const navigate = useNavigate();

  // Hydrate trip status (backend → local)
  useEffect(() => {
    const hydrate = async () => {
      try {
        const res = await axios.get("/tripwell/livestatus");
        localStorage.setItem("tripData", JSON.stringify(res.data));
        setTripData(res.data);
      } catch (err) {
        console.warn("⚠️ Backend hydrate failed:", err);
        const local = JSON.parse(localStorage.getItem("tripData") || "null");
        setTripData(local || { currentDay: 1, currentBlock: "morning", tripComplete: false });
      }
    };
    hydrate();
  }, []);

  if (!tripData) return <p>Loading...</p>;

  return (
    <div className="p-8 max-w-2xl mx-auto text-center">
      <h1 className="text-3xl font-bold">Day {tripData.currentDay}</h1>
      <p className="text-lg text-gray-600">Block: {tripData.currentBlock}</p>
      <button
        onClick={() => navigate("/tripliveblock")}
        className="mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg"
      >
        Start {tripData.currentBlock}
      </button>
    </div>
  );
}
