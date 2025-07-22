import { useNavigate } from "react-router-dom";
import { auth, provider } from "../firebase";

export default function JoinAccess() {
  const navigate = useNavigate();

  const handleGoogleAuth = async () => {
    try {
      await auth.signInWithPopup(provider);
      navigate("/join");
    } catch (err) {
      console.error("Google auth failed", err);
      alert("Sign-in failed. Please try again.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 space-y-6 text-center">
      <h1 className="text-3xl font-bold text-blue-700">Join Your Trip</h1>
      <p className="text-lg text-gray-700">
        To continue, please sign up or sign in.
      </p>

      <div className="flex flex-col space-y-4">
        <button
          onClick={handleGoogleAuth}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-lg"
        >
          Sign Up
        </button>
        <button
          onClick={handleGoogleAuth}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-lg"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
