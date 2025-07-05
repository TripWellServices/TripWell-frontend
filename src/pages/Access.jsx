import { useNavigate } from "react-router-dom";

export default function Access() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Welcome to TripWell</h1>

      <p className="max-w-md text-gray-600 mb-8">
        Before we go any further, we just need to know who you are. If you’ve used TripWell before, sign in. 
        If you’re new, go ahead and sign up — it only takes a second.
      </p>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={() => navigate("/sign-in")}
          className="bg-blue-600 text-white py-3 px-6 rounded hover:bg-blue-700 transition"
        >
          🔐 Sign In
        </button>

        <button
          onClick={() => navigate("/sign-in")}
          className="bg-gray-100 text-black py-3 px-6 rounded hover:bg-gray-200 transition"
        >
          ✍️ Sign Up
        </button>

        <button
          onClick={() => navigate("/explainer")}
          className="text-sm text-blue-600 underline hover:text-blue-800 mt-2"
        >
          ❓ What is TripWell?
        </button>
      </div>
    </div>
  );
}
