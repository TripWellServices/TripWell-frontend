import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserAndTrip } from "../services/userService";

export default function TripPlannerAI() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { user } = await getUserAndTrip();
      const token = await user.firebaseToken || await user.firebaseUser?.getIdToken?.();

      const reply = await submitTripPrompt({ prompt, token });
      setResponse(reply.message || "No response.");
    } catch (err) {
      console.error("❌ AI prompt failed:", err);
      setResponse("Error generating trip plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Trip Planner AI</h1>
      <textarea
        className="w-full p-3 border rounded"
        rows={4}
        placeholder="Where do you want to go and what do you want to do?"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition"
      >
        Generate Plan
      </button>
      {loading && <p className="text-gray-500">Thinking...</p>}
      {response && (
        <div className="bg-gray-100 p-4 rounded border">
          <pre className="whitespace-pre-wrap">{response}</pre>
        </div>
      )}
    </div>
  );
}
