import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, provider } from "../firebase";

export default function PreJoinTrip() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      const firebaseUser = auth.currentUser;

      if (firebaseUser) {
        const token = await firebaseUser.getIdToken(true);
        const res = await fetch("https://gofastbackend.onrender.com/tripwell/whoami", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        const user = data?.user;
        const trip = data?.trip;

        if (user && trip) {
          navigate("/tripwell/alreadyjoined");
        } else if (user && !trip) {
          navigate("/tripwell/join");
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkStatus();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await auth.signInWithPopup(provider);
      navigate("/tripwell/join");
    } catch (err) {
      console.error("❌ Google sign-in failed", err);
      alert("Sign-in failed. Try again.");
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Checking your trip status…</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-8 space-y-6 text-center">
      <h1 className="text-3xl font-bold text-blue-700">Join a Trip</h1>
      <p className="text-gray-700 text-lg">
        Sign in to get connected with your trip crew.
      </p>

      <button
        onClick={handleGoogleSignIn}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-lg"
      >
        🔐 Sign In with Google
      </button>
    </div>
  );
}