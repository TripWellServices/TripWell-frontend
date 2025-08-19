import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { auth } from "../firebase";
import BACKEND_URL from "../config";

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [state, setState] = useState({
    userData: null,
    tripData: null,
    tripIntentData: null,
    anchorSelectData: null,
    itineraryData: null,
    profileComplete: false,
    validation: null,
    loading: false,
    error: null,
  });

  // Load from localStorage once
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "null");
      const tripData = JSON.parse(localStorage.getItem("tripData") || "null");
      const tripIntentData = JSON.parse(localStorage.getItem("tripIntentData") || "null");
      const anchorSelectData = JSON.parse(localStorage.getItem("anchorSelectData") || "null");
      const itineraryData = JSON.parse(localStorage.getItem("itineraryData") || "null");
      const profileComplete = localStorage.getItem("profileComplete") === "true";
      setState((s) => ({ ...s, userData, tripData, tripIntentData, anchorSelectData, itineraryData, profileComplete }));
    } catch (e) {
      console.warn("Failed to load initial localStorage state", e);
    }
  }, []);

  const saveAllToLocal = useCallback((payload) => {
    if (!payload) return;
    if (payload.userData) {
      localStorage.setItem("userData", JSON.stringify(payload.userData));
      localStorage.setItem("profileComplete", String(!!payload.userData.profileComplete));
    }
    if (payload.tripData) localStorage.setItem("tripData", JSON.stringify(payload.tripData));
    if (payload.tripIntentData) localStorage.setItem("tripIntentData", JSON.stringify(payload.tripIntentData));
    if (payload.anchorSelectData) localStorage.setItem("anchorSelectData", JSON.stringify(payload.anchorSelectData));
    if (payload.itineraryData) localStorage.setItem("itineraryData", JSON.stringify(payload.itineraryData));
  }, []);

  const refreshFromBackend = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      // Ensure Firebase user
      const user = await new Promise((resolve) => {
        const unsub = auth.onAuthStateChanged((u) => {
          unsub();
          resolve(u);
        });
      });
      if (!user) throw new Error("No Firebase user found");

      const token = await auth.currentUser.getIdToken(true);
      // Prefer /hydrate if present; fallback to /localflush
      let res = await fetch(`${BACKEND_URL}/tripwell/hydrate`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) {
        res = await fetch(`${BACKEND_URL}/tripwell/localflush`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
      }
      if (!res.ok) throw new Error(`Refresh failed (${res.status})`);
      const payload = await res.json();

      // Persist and update state
      saveAllToLocal(payload);
      setState((s) => ({
        ...s,
        userData: payload.userData ?? s.userData,
        tripData: payload.tripData ?? s.tripData,
        tripIntentData: payload.tripIntentData ?? s.tripIntentData,
        anchorSelectData: payload.anchorSelectData ?? s.anchorSelectData,
        itineraryData: payload.itineraryData ?? s.itineraryData,
        profileComplete: payload.userData?.profileComplete ?? s.profileComplete,
        validation: payload.validation ?? s.validation,
        loading: false,
        error: null,
      }));
      return payload;
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e.message }));
      throw e;
    }
  }, [saveAllToLocal]);

  const value = useMemo(() => ({
    ...state,
    refreshFromBackend,
    setState,
  }), [state, refreshFromBackend]);

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
