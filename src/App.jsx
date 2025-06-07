import { BrowserRouter, Routes, Route } from "react-router-dom";

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

// ✅ FIXED PATH
import TripWrapper from "./wrappers/TripWrapper";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explainer" element={<Explainer />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<ProfileSetup />} />
        <Route path="/hub" element={<GeneralHub />} />
        <Route path="/tripwellhub" element={<TripWellHub />} />
        <Route path="/tripsetup" element={<TripSetup />} />
        <Route path="/tripjoin" element={<TripJoin />} />

        {/* ✅ TripPlannerAI behind wrapper */}
        <Route
          path="/tripplannerai"
          element={
            <TripWrapper>
              <TripPlannerAI />
            </TripWrapper>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
