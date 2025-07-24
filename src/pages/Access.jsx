import { useNavigate } from "react-router-dom";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export default function Access() {
  const navigate = useNavigate();
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  const handleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Step 1: create or find the user in backend
      await fetch("/tripwell/user/createOrFind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUID: user.uid, email: user.email }),
      });

      // Step 2: get full profile
      const res = await fetch("/tripwell/whoami");
      const data = await res.json();

      if (!data?.user?._id || !data?.user?.name) {
        navigate("/profilesetup");
      } else {
        navigate("/");
      }

    } catch (err) {
      console.error("Authentication failed:", err);
      alert("Something went wrong signing you in. Please try again.");
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
          🔐 Sign In
        </button>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Want to learn more?{" "}
          <span
            onClick={() => navigate("/explainer")}
            className="text-blue-600 underline cursor-pointer hover:text-blue-800"
          >
            What is TripWell?
          </span>
        </p>
      </div>
    </div>
  );
}
