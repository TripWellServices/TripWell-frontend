// src/pages/Home.jsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTripContext } from "../context/TripContext";
import TripWrapper from "../components/TripWrapper";
import tripwellLogo from "../assets/tripwell-logo.png";

export default function Home() {
  const navigate = useNavigate();
  const { firebaseUser, trip, authReady } = useTripContext();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!authReady) return;

      if (!firebaseUser) {
        navigate("/explainer");
      } else if (!trip) {
        navigate("/generalhub");
      } else {
        navigate("/trip/hub");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [authReady, firebaseUser, trip, navigate]);

  return (
    <TripWrapper>
      <div className="flex justify-center items-center h-screen bg-white">
        <img
          src={tripwellLogo}
          alt="TripWell Logo"
          className="w-48 h-auto"
        />
      </div>
    </TripWrapper>
  );
}
