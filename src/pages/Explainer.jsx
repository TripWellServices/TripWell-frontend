import { useNavigate } from "react-router-dom";

export default function Explainer() {
  const navigate = useNavigate();

  return (
    <div className="p-10 text-center">
      <h2 className="text-3xl font-semibold mb-4">Welcome to TripWell</h2>
      <p className="mb-6">
        We help you plan your trips and execute them with calm, clarity, and confidence.
      </p>
      <button
        className="bg-blue-600 text-white px-6 py-2 rounded mr-4"
        onClick={() => navigate("/signup")}
      >
        Sign Up with Google
      </button>
      <p className="text-sm text-gray-600 mt-4">
        Already have an account?{" "}
        <a className="underline text-blue-500" href="/signin">
          Sign In
        </a>
      </p>
    </div>
  );
}
