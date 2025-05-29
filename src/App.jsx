import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";

// Pages
import Home from "./pages/Home";
import Explainer from "./pages/Explainer";
import GeneralHub from "./pages/GeneralHub";
import TripWellHub from "./pages/TripWellHub";
import TripSetup from "./pages/TripSetup";
import TripJoin from "./pages/TripJoin";
import ProfileSetup from "./pages/ProfileSetup";
import TripPlannerAI from "./pages/TripPlannerAI";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explainer" element={<Explainer />} />

        <Route path="/hub" element={user ? <GeneralHub /> : <Navigate to="/" />} />
        <Route path="/trip-setup" element={user ? <TripSetup /> : <Navigate to="/" />} />
        <Route path="/join-trip" element={user ? <TripJoin /> : <Navigate to="/" />} />
        <Route path="/trip/:tripId" element={user ? <TripWellHub /> : <Navigate to="/" />} />
        <Route path="/profile" element={user ? <ProfileSetup /> : <Navigate to="/" />} />
        <Route path="/trip-planner-ai" element={user ? <TripPlannerAI /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
