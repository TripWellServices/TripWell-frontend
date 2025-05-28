import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Explainer from "./pages/Explainer";
import SignUp from "./pages/SignUp";
import ProfileSetup from "./pages/ProfileSetup";
import TripWellHub from "./pages/TripWellHub";
import TripPlannerAI from "./pages/TripPlannerAI";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explainer" element={<Explainer />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/hub" element={<TripWellHub />} />
        <Route path="/trip-planner-ai" element={<TripPlannerAI />} />
      </Routes>
    </Router>
  );
}
