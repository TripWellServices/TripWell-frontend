import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();

    try {
      await signInWithPopup(auth, provider);
      navigate("/hub"); // Go to hub after login
    } catch (err) {
      console.error("Login failed:", err);
      alert("Google login failed.");
    }
  };

  return (
    <div className="text-center p-10">
      <h1 className="text-5xl font-bold mb-4">TripWell</h1>
      <p className="text-lg mb-6">Your smart co-pilot for travel planning and execution.</p>

      <button
        onClick={handleGoogleLogin}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      >
        Sign In with Google
      </button>

      <div className="mt-6">
        <button
          onClick={() => navigate("/explainer")}
          className="text-blue-500 underline"
        >
          Learn More First
        </button>
      </div>
    </div>
  );
}
