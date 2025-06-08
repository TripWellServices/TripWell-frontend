// src/pages/Home.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import tripwellLogo from "../assets/tripwell-logo.png";

export default function Home() {
  const navigate = useNavigate();
  const [tokenChecked, setTokenChecked] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const user = getAuth().currentUser;
      if (user) {
        const token = await user.getIdToken(true);
        if (token) setHasToken(true);
      }
      setTokenChecked(true);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!tokenChecked) return;

    const timer = setTimeout(() => {
      if (!hasToken) {
        navigate("/explainer");
      } else {
        // You could fetch /tripwell/whoami here if not using TripContext
        navigate("/tripwellhub");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [tokenChecked, hasToken, navigate]);

  return (
    <div className="flex justify-center items-center h-screen bg-white">
      <img
        src={tripwellLogo}
        alt="TripWell Logo"
        className="w-48 h-auto"
      />
    </div>
  );
}
