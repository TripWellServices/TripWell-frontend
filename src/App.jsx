import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import axios from "axios";

// Pages
import Home from "./pages/Home";
import Explainer from "./pages/Explainer";
import GeneralHub from "./pages/GeneralHub";
import TripWellHub from "./pages/TripWellHub";
import TripSetup from "./pages/TripSetup";
import TripJoin from "./pages/TripJoin";
import ProfileSetup from "./pages/ProfileSetup";
import TripPlannerAI from "./pages/TripPlannerAI";
import TripCreated from "./pages/TripCreated";
import Login from "./pages/Login";

// 🔒 Attach Firebase token to every Axios request
axios.interceptors.request.use(
  async (config) => {
    const user = getAuth().currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/explainer"
          element={
            localStorage.getItem("uid") ? <Navigate to="/login" /> : <Explainer />
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />

        {/* Auth-Protected Routes */}
        <Route path="/hub" element={user ? <GeneralHub /> : <Navigate to="/explainer" />} />
        <Route path="/trip-setup" element={user ? <TripSetup /> : <Navigate to="/explainer" />} />
        <Route path="/join-trip" element={user ? <TripJoin /> : <Navigate to="/explainer" />} />
        <Route path="/tripwellhub" element={user ? <TripWellHub /> : <Navigate to="/explainer" />} />
        <Route path="/trip-created/:tripId" element={user ? <TripCreated /> : <Navigate to="/explainer" />} />
        <Route path="/profile" element={user ? <ProfileSetup /> : <Navigate to="/explainer" />} />
        <Route path="/trip-planner-ai" element={user ? <TripPlannerAI /> : <Navigate to="/explainer" />} />
      </Routes>
    </BrowserRouter>
  );
}
