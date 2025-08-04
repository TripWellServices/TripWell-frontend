import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Access() {
  const navigate = useNavigate();
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  // 🚨 Hardcoded backend URL
  const backendUrl = "https://gofastbackend.onrender.com";

  const handleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("✅ Authenticated user:", user);

      const res = await fetch(`${backendUrl}/tripwell/user/createOrFind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseId: user.uid,
          email: user.email,
        }),
      });

      const data = await res.json();
      console.log("✅ Backend user response:", data);

      if (!data.name || data.name.trim() === "") {
        navigate("/profilesetup");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("❌ Auth failed", err);
      alert("Authentication error — please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Welcome to TripWell</h1>

      <p className="max-w-md text-gray-600 mb-8">
        Before we go any further, we just need to know who you are.
      </p>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={handleAuth}
          className="bg-blue-600 text-white py-3 px-6 rounded hover:bg-blue-700 transition"
        >
          🔐 Sign Up
        </button>

        <button
          onClick={() => navigate("/explainer")}
          className="text-sm text-blue-600 underline hover:text-blue-800 mt-2"
        >
          What is TripWell?
        </button>
      </div>
    </div>
  );
}
