import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppInitGate from "./pages/AppInitGate"; // ✅ FIXED PATH

// PAGES
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
  return (
    <BrowserRouter>
      <AppInitGate>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explainer" element={<Explainer />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<ProfileSetup />} />
          <Route path="/hub" element={<GeneralHub />} />
          <Route path="/tripwellhub" element={<TripWellHub />} />
          <Route path="/tripsetup" element={<TripSetup />} />
          <Route path="/tripjoin" element={<TripJoin />} />
          <Route path="/tripplannerai" element={<TripPlannerAI />} />
        </Routes>
      </AppInitGate>
    </BrowserRouter>
  );
}