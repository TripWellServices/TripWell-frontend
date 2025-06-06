import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import TripPlannerAI from "./TripPlannerAI";

export default function TripWrapper() {
  const [userData, setUserData] = useState(null);
  const [tripData, setTripData] = useState(null);

  useEffect(() => {
    async function hydrate() {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken(true);

        const userRes = await fetch("https://gofastbackend.onrender.com/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();
        setUserData(userData);

        const tripRes = await fetch(`https://gofastbackend.onrender.com/trip/user/${userData._id}/latest`);
        const tripData = await tripRes.json();
        setTripData(tripData);
      } catch (err) {
        console.error("❌ Failed to hydrate GPT inputs:", err);
      }
    }

    hydrate();
  }, []);

  if (!userData || !tripData) return <div className="p-6">Loading TripWell AI…</div>;

  return <TripPlannerAI userData={userData} tripData={tripData} />;
}
