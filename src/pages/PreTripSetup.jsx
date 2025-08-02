import { useNavigate } from "react-router-dom";

export default function PreTripSetup() {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto p-6 text-center space-y-6">
      <h1 className="text-2xl font-bold">Hi there!</h1>
      <p>
        We’re about to launch you on your planning journey.
        If you don’t have a user login yet, no worries — it won’t take long, and then you’ll be on your way.
      </p>

      <button
        onClick={() => navigate("/tripsetup")}
        className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition"
      >
        Start my journey
      </button>

      <p className="text-gray-600 mt-4">
        Not ready yet or want to explore other options?{" "}
        <button
          onClick={() => navigate("/")}
          className="underline text-gray-700"
        >
          Return home
        </button>{" "}
        to make a different selection.
      </p>
    </div>
  );
}
