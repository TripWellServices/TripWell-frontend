import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import axios from "axios";
import { initializeApp } from "firebase/app";
import { useNavigate } from "react-router-dom";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function SignUp() {
  const navigate = useNavigate();  // Use navigate hook for routing

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const token = await firebaseUser.getIdToken();

      const response = await axios.post("/auth/firebase-login", {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("User signed in:", response.data.user);
      // Navigate to the next page after successful sign up (e.g., Profile or Trip Setup)
      navigate("/trip-setup");  // You can change this to /profile or any other page

    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  return (
    <div className="text-center p-10">
      <h2 className="text-3xl font-semibold mb-4">Create Your TripWell Account</h2>
      <p className="mb-6">Sign up with Google to get started planning your next adventure.</p>
      <button onClick={handleGoogleSignUp} className="bg-green-600 text-white px-6 py-2 rounded">
        Sign Up with Google
      </button>
    </div>
  );
}
