import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Store uid in localStorage for session fallback
      localStorage.setItem("uid", user.uid);

      // Fetch user profile from backend
      const res = await axios.get(`/api/users/${user.uid}`);
      const profile = res.data;

      if (profile.tripId) {
        navigate("/tripwellhub");
      } else {
        navigate("/hub");
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "4rem" }}>
      <h1>Welcome Back to TripWell</h1>
      <p>Sign in to access your trip.</p>
      <button onClick={handleLogin}>Sign in with Google</button>
    </div>
  );
}
