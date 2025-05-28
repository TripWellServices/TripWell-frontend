import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult
} from "firebase/auth";
import axios from "axios";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function SignUp() {
  const navigate = useNavigate();

  const handleGoogleRedirect = () => {
    signInWithRedirect(auth, provider);
  };

  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (!result) return;

        const firebaseUser = result.user;
        const token = await firebaseUser.getIdToken();

        const response = await axios.post(
          "https://tripwell-backend.onrender.com/auth/firebase-login",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Redirect login success:", response.data);
        navigate("/profile-setup");
      })
      .catch((error) => {
        console.error("Redirect login error:", error);
      });
  }, []);

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Let’s Get You In</h1>
      <button
        onClick={handleGoogleRedirect}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        Sign in with Google
      </button>
    </div>
  );
}
