import { auth } from "../firebase";
import { getIdToken } from "firebase/auth";

export const getUserAndTrip = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) return { user: null, trip: null };

  try {
    const token = await getIdToken(currentUser, true);
    const res = await fetch("https://gofastbackend.onrender.com/tripwell/whoami", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("❌ whoami failed");

    const { user, trip } = await res.json();
    return { user, trip };
  } catch (err) {
    console.error("💥 getUserAndTrip failed:", err);
    return { user: null, trip: null };
  }
};
