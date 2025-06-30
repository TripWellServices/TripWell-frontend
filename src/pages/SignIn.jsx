import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function SignIn() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) navigate("/trip-setup");
    });
    return () => unsub();
  }, [navigate]);

  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/trip-setup");
    } catch (err) {
      console.error("Google Auth failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">TripWell</h1>
      <p className="text-gray-600 mb-8">Let’s plan something unforgettable.</p>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={handleGoogleAuth}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded shadow"
        >
          🔐 Sign In
        </button>

        <button
          onClick={handleGoogleAuth}
          className="bg-gray-100 hover:bg-gray-200 text-black py-2 rounded shadow"
        >
          ✍️ Sign Up
        </button>
      </div>
    </div>
  );
}