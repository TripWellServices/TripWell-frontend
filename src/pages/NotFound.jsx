import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-300 to-blue-200 flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-3xl shadow-2xl text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">⚠️ Page Not Found</h1>
        <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
        <div className="space-y-4">
          <button
            onClick={() => navigate("/")}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
          >
            🏠 Go Home
          </button>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200"
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
