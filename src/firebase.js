// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "",
  AIzaSyCjpoH763y2GH4VDc181IUBaZHqE_ryZ1cauthDomain: "gofast-a5f94.firebaseapp.com",
  projectId: "gofast-a5f94",
  storageBucket: "gofast-a5f94.firebasestorage.app",
  messagingSenderId: "500941094498",
  appId: "1:500941094498:web:eee09da6918f9e53889b3b",
  measurementId: "G-L0NGHRBSDE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider(); // ✅ Add this line

export { app, auth, provider };
