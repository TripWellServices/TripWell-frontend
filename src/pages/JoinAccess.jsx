import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import axios from "axios";

export default function JoinAccess() {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Post to backend to create or find user
      const res = await axios.post("/tripwell/user/createOrFind", {
        firebaseUID: user.uid,
        email: user.email,
      });

      navigate("/join"); // Continue to join code entry
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
        <p>Decided you want to plan the trip instead?</p>
        <button
          onClick={() => navigate("/")}
          className="text-blue-700 underline mt-1"
        >
          🔁 Go Back Home
        </button>
      </div>
    </div>
  );
}
