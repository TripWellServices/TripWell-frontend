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
import TripCreated from "./pages/TripCreated"; // ✅ new

// 🔒 Axios Interceptor: auto-attach Firebase token to all requests
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        localStorage.setItem("firebaseId", u.uid);
      } else {
        localStorage.removeItem("firebaseId");
        localStorage.removeItem("activeTripId");
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route
          path="/explainer"
          element={
            user ? (
              localStorage.getItem("activeTripId") ? (
                <Navigate to={`/trip/${localStorage.getItem("activeTripId")}`} />
              ) : (
                <Navigate to="/hub" />
              )
            ) : (
              <Explainer />
            )
          }
        />

        {/* Auth-Protected Routes */}
        <Route path="/hub" element={user ? <GeneralHub /> : <Navigate to="/explainer" />} />
        <Route path="/trip-setup" element={user ? <TripSetup /> : <Navigate to="/explainer" />} />
        <Route path="/join-trip" element={user ? <TripJoin /> : <Navigate to="/explainer" />} />
        <Route path="/trip/:tripId" element={user ? <TripWellHub /> : <Navigate to="/explainer" />} />
        <Route path="/trip-created/:tripId" element={user ? <TripCreated /> : <Navigate to="/explainer" />} /> {/* ✅ added */}
        <Route path="/profile" element={user ? <ProfileSetup /> : <Navigate to="/explainer" />} />
        <Route path="/trip-planner-ai" element={user ? <TripPlannerAI /> : <Navigate to="/explainer" />} />
      </Routes>
    </BrowserRouter>
  );
}
