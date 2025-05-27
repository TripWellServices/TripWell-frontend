// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import TripWellHub from "./pages/TripWellHub";
import GeneralHub from "./pages/GeneralHub";
import TripSetup from "./pages/TripSetup";
import TripJoin from "./pages/TripJoin";
import LoginPage from "./pages/LoginPage";
import AppInitGate from "./pages/AppInitGate";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/hub" /> : <LoginPage />} />
        <Route path="/hub" element={user ? <GeneralHub /> : <Navigate to="/login" />} />
        <Route path="/trip/:tripId" element={user ? <TripWellHub /> : <Navigate to="/login" />} />
        <Route path="/trip-setup" element={user ? <TripSetup /> : <Navigate to="/login" />} />
        <Route path="/join-trip" element={user ? <TripJoin /> : <Navigate to="/login" />} />
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/hub" />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </BrowserRouter>
  );
}
