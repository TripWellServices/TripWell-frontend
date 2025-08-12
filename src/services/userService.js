import { auth } from "../firebase";
import { getIdToken } from "firebase/auth";
import BACKEND_URL from "../config";

export const getUserAndTrip = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) return { user: null, trip: null };

  try {
    const token = await getIdToken(currentUser, true);
    const res = await fetch(`${BACKEND_URL}/tripwell/whoami`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    });

    if (!res.ok) throw new Error("❌ whoami failed");

    const { user } = await res.json();
    return { user, trip: null }; // whoami only returns user
  } catch (err) {
    console.error("💥 getUserAndTrip failed:", err);
    return { user: null, trip: null };
  }
};
