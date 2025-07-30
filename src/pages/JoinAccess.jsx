import { useNavigate } from "react-router-dom";
import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth"; // ✅ this is needed

export default function JoinAccess() {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider); // ✅ correct usage
      navigate("/join");
    } catch (err) {
      console.error("Sign-in failed", err);
      alert("Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 space-y-6 text-center">
      <h1 className="text-3xl font-bold text-blue-700">Sign In to Join Your Trip</h1>
      <p className="text-lg text-gray-700">
        To join your TripWell experience, you’ll need to sign in with Google.
        This helps us securely connect you to your crew and your trip itinerary.
      </p>

      <button
        onClick={handleGoogleSignIn}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-lg"
      >
        🔐 Sign In with Google
      </button>

      <div className="pt-4 text-sm text-gray-600">
        <p>Already signed up and landed here by mistake?</p>
        <button
          onClick={() => navigate("/home")}
          className="text-blue-700 underline mt-1"
        >
          🔁 Go Back Home
        </button>
      </div>
    </div>
  );
}
