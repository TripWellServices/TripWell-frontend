// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
 apiKey: "AIzaSyCjpoH763y2GH4VDc181IUBaZHqE_ryZ1c",
authDomain: "gofast-a5f94.firebaseapp.com",

  projectId: "gofast-a5f94",
  storageBucket: "gofast-a5f94.appspot.com", // ✅ fixed
  messagingSenderId: "500941094498",
  appId: "1:500941094498:web:eee09da6918f9e53889b3b",
  measurementId: "G-L0NGHRBSDE"
};

// Initialize Firebase with error handling
let app, auth;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log("✅ Firebase initialized successfully");
} catch (error) {
  console.error("❌ Firebase initialization error:", error);
  // Fallback initialization
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
}

// Handle IndexedDB errors globally
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && event.error.message.includes('IndexedDB')) {
    console.warn("⚠️ IndexedDB error detected, this is usually harmless:", event.error.message);
    // Prevent the error from breaking the app
    event.preventDefault();
  }
});

export { app, auth };
