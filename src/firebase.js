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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
