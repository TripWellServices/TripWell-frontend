import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="text-center p-10">
      <h1 className="text-5xl font-bold mb-4">TripWell</h1>
      <p className="text-lg mb-6">Your smart co-pilot for travel planning and execution.</p>
      <button
        onClick={() => navigate("/explainer")}
        className="text-blue-500 underline"
      >
        Get Started
      </button>
    </div>
  );
}
