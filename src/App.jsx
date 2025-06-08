import { Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { auth } from "./firebase";

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

// ✅ Attach Firebase token to all Axios requests
axios.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/explainer" element={<Explainer />} />

      {/* Let pages handle auth/trip gating */}
      <Route path="/hub" element={<GeneralHub />} />
      <Route path="/trip-setup" element={<TripSetup />} />
      <Route path="/join-trip" element={<TripJoin />} />
      <Route path="/tripwellhub" element={<TripWellHub />} />
      <Route path="/trip-created/:tripId" element={<TripCreated />} />
      <Route path="/profile" element={<ProfileSetup />} />
      <Route path="/trip-planner-ai" element={<TripPlannerAI />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
