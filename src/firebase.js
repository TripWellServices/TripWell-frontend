// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// ✅ Replace with your real Firebase project config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "your-msg-sender-id",
  appId: "your-app-id"
};

// 🧠 Ensure Firebase is only initialized once
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
