import { useNavigate } from "react-router-dom";
import { auth, provider } from "../firebase";

export default function JoinAccess() {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await auth.signInWithPopup(provider);
      navigate("/join"); // ✅ Go straight into join flow
    } catch (err) {
      console.error("Google sign-in failed", err);
      alert("Sign-in failed. Please try again.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 space-y-6 text-center">
      <h1 className="text-3xl font-bold text-blue-700">Sign In to Join Your Trip</h1>

      <p className="text-lg text-gray-700">
        To join your TripWell experience, please sign in with Google.
        This helps us securely connect you to your crew and your shared itinerary.
      </p>

      <button
        onClick={handleGoogleSignIn}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-lg"
      >
        🔐 Sign in with Google
      </button>

      <div className="pt-4 text-sm text-gray-600 space-y-2">
        <p>Think you’re already signed up?</p>
        <button
          onClick={handleGoogleSignIn}
          className="text-blue-700 underline"
        >
          🔁 Just click here to verify
        </button>

        <p className="mt-4 text-gray-500">
          Decided you want to plan the trip instead?
        </p>
        <button
          onClick={() => navigate("/")}
          className="text-blue-700 underline"
        >
          🏠 Head back home
        </button>
      </div>
    </div>
  );
}
