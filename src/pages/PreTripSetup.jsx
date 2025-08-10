import { useNavigate } from "react-router-dom";

export default function PreTripSetup() {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto p-6 text-center space-y-6">
      <h1 className="text-2xl font-bold">Let’s get your trip started</h1>
      <p>
        We’ll walk you through the setup step-by-step. 
        If you’re new to TripWell, we’ll create your account along the way — quick and easy.
      </p>

      <button
        onClick={() => navigate("/tripsetup")}
        className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition"
      >
        Start my journey
      </button>

      <p className="text-gray-600 mt-4">
        Not ready yet?{" "}
        <button
          onClick={() => navigate("/")}
          className="underline text-gray-700"
        >
          Return home
        </button>
      </p>
    </div>
  );
}
