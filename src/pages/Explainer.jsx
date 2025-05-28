import { useNavigate } from "react-router-dom";

export default function Explainer() {
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-3xl mx-auto text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to TripWell</h1>

      <p className="text-lg mb-4">
        TripWell helps you plan smarter and travel better — from logistics to lodging to movement. It’s your real-time co-pilot for staying grounded while you go.
      </p>

      <p className="text-lg mb-8">
        Set your intentions. Move with purpose. And never lose your rhythm, no matter the destination.
      </p>

      <button
        onClick={() => navigate("/signup")}
        className="bg-blue-600 text-white text-lg px-6 py-3 rounded hover:bg-blue-700"
      >
        Let’s Go → Sign In with Google
      </button>
    </div>
  );
}
