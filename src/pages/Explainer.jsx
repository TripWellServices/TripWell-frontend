import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Explainer() {
  const navigate = useNavigate();

  const handleAuth = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      const res = await fetch("/tripwell/whoami");
      const data = await res.json();

      if (data?.trip) {
        navigate("/trip/hub");
      } else {
        navigate("/generalhub");
      }
    } catch (err) {
      console.error("Google Auth failed:", err);
    }
  };

  return (
    <div className="p-10 text-center">
      <h2 className="text-3xl font-semibold mb-4">Welcome to TripWell</h2>
      <p className="mb-6">We help you plan your trips and execute them with calm, clarity, and confidence.</p>

      <button
        onClick={handleAuth}
        className="bg-blue-600 text-white px-6 py-2 rounded mr-4 hover:bg-blue-700 transition"
      >
        Sign Up with Google
      </button>

      <p className="text-sm text-gray-600 mt-4">
        Already have an account?{" "}
        <button onClick={handleAuth} className="underline text-blue-500 hover:text-blue-700">
          Sign In
        </button>
      </p>
    </div>
  );
}
