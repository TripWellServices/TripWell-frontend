import { useNavigate } from "react-router-dom";

export default function Explainer() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-10 text-center bg-white flex flex-col items-center justify-center">
      <h2 className="text-3xl font-semibold text-green-600 mb-4">What is TripWell?</h2>

      <p className="max-w-xl text-gray-700 mb-6">
        TripWell helps you plan intentional trips — not just where you go, but how you experience each day.
        Our AI helps you build a real itinerary around your vibe, your people, and your pace.
      </p>

      <p className="max-w-xl text-gray-700 mb-6">
        We don’t just help you book. We help you live the trip — one thoughtful day at a time.
      </p>

      <button
        onClick={() => navigate("/sign-in")}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        🌍 Sign Up and Start Planning
      </button>
    </div>
  );
}