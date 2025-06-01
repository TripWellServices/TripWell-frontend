import { BrowserRouter, Routes, Route } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import axios from "axios";

// Firebase token injector for Axios
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

// ✅ Pages
import AppInitGate from "./pages/AppInitGate";
import Home from "./pages/Home";
import Explainer from "./pages/Explainer";
import Login from "./pages/Login";
import ProfileSetup from "./pages/ProfileSetup";
import GeneralHub from "./pages/GeneralHub";
import TripWellHub from "./pages/TripWellHub";
import TripSetup from "./pages/TripSetup";
import TripJoin from "./pages/TripJoin";
import TripPlannerAI from "./pages/TripPlannerAI";

export default function App() {
  const [firebaseReady, setFirebaseReady] = useState(false);

  // This ensures Firebase is fully initialized
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), () => {
      setFirebaseReady(true);
    });
    return () => unsubscribe();
  }, []);

  if (!firebaseReady) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppInitGate />} />
        <Route path="/home" element={<Home />} />
        <Route path="/explainer" element={<Explainer />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<ProfileSetup />} />
        <Route path="/hub" element={<GeneralHub />} />
        <Route path="/tripwellhub" element={<TripWellHub />} />
        <Route path="/tripsetup" element={<TripSetup />} />
        <Route path="/tripjoin" element={<TripJoin />} />
        <Route path="/tripplannerai" element={<TripPlannerAI />} />
      </Routes>
    </BrowserRouter>
  );
}
