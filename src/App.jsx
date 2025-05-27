import { BrowserRouter, Routes, Route } from "react-router-dom";
import TripWellHub from "./pages/TripWellHub";
import GeneralHub from "./pages/GeneralHub";
import TripSetup from "./pages/TripSetup";
import TripJoin from "./pages/TripJoin";
import LoginPage from "./pages/LoginPage";
import AppInitGate from "./pages/AppInitGate";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppInitGate />} />
        <Route path="/hub" element={<GeneralHub />} />
        <Route path="/trip/:tripId" element={<TripWellHub />} />
        <Route path="/trip-setup" element={<TripSetup />} />
        <Route path="/join-trip" element={<TripJoin />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
