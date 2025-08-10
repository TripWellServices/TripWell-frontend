// src/services/tripChatService.js
import BACKEND_URL from "../config";

export async function submitTripPrompt({ tripId, userInput, tripData, userData }) {
  try {
    const res = await fetch(`${BACKEND_URL}/tripwell/${tripId}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userInput,
        tripData,
        userData,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`❌ GPT chat failed: ${errorText}`);
    }

    return await res.json();
  } catch (err) {
    console.error("❌ AI prompt failed:", err);
    return { error: err.message || "Unknown error" };
  }
}
