import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { getIdToken } from "../services/firebaseAuthService"; // custom helper
import { submitTripPrompt } from "../services/tripChatService";

export default function TripPlannerAI() {
  const [tripExists, setTripExists] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkTrip = async () => {
      const user = auth.currentUser;
      if (!user) return navigate("/explainer");

      const token = await getIdToken(user);
      const res = await fetch("https://gofastbackend.onrender.com/tripwell/whoami", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data?.trip) return navigate("/trip/create");
      setTripExists(true);
    };
    checkTrip();
  }, []);

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user || !tripExists) return;
    const token = await getIdToken(user);
    const reply = await submitTripPrompt(prompt, token);
    setResponse(reply);
  };

  if (!tripExists) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Trip Planner AI</h1>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full border p-2 mb-4"
        placeholder="Ask me about your trip..."
      />
      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2">
        Ask GPT
      </button>
      {response && (
        <div className="mt-4 p-4 border bg-gray-100">
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
