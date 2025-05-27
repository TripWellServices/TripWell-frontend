import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";

// Pages
import Home from "./pages/Home";
import Explainer from "./pages/Explainer";
import SignUp from "./pages/SignUp";
import LoginPage from "./pages/LoginPage";
import TripWellHub from "./pages/TripWellHub";
import GeneralHub from "./pages/GeneralHub";
import TripSetup from "./pages/TripSetup";
import TripJoin from "./pages/TripJoin";
import ProfileSetup from "./pages/ProfileSetup"; // Confirm filename
import TripPlannerAI from "./pages/TripPlannerAI"; // Confirm filename

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
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/hub" />} />

        <Route path="/hub" element={user ? <GeneralHub /> : <Navigate to="/login" />} />
        <Route path="/trip/:tripId" element={user ? <TripWellHub /> : <Navigate to="/login" />} />
        <Route path="/trip-setup" element={user ? <TripSetup /> : <Navigate to="/login" />} />
        <Route path="/join-trip" element={user ? <TripJoin /> : <Navigate to="/login" />} />

        <Route path="/profile" element={user ? <ProfileSetup /> : <Navigate to="/login" />} />
        <Route path="/trip-planner-ai" element={user ? <TripPlannerAI /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
