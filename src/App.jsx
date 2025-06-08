import { Routes, Route, Navigate } from "react-router-dom";
import { useTripContext } from "./context/TripContext";
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
  const { user, loading } = useTripContext();

  if (loading) return <div>Loading app...</div>;

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/explainer" element={<Explainer />} />

      {/* Auth-Protected Routes */}
      <Route path="/hub" element={user ? <GeneralHub /> : <Navigate to="/explainer" />} />
      <Route path="/trip-setup" element={user ? <TripSetup /> : <Navigate to="/explainer" />} />
      <Route path="/join-trip" element={user ? <TripJoin /> : <Navigate to="/explainer" />} />
      <Route path="/tripwellhub" element={user ? <TripWellHub /> : <Navigate to="/explainer" />} />
      <Route path="/trip-created/:tripId" element={user ? <TripCreated /> : <Navigate to="/explainer" />} />
      <Route path="/profile" element={user ? <ProfileSetup /> : <Navigate to="/explainer" />} />
      <Route path="/trip-planner-ai" element={user ? <TripPlannerAI /> : <Navigate to="/explainer" />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
