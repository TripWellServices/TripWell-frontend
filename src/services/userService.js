import { auth } from "../firebase";
import axios from "axios";
import BACKEND_URL from "../config";

export const getUserAndTrip = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) return { user: null, trip: null };

  try {
    const res = await axios.get(`${BACKEND_URL}/tripwell/whoami`);

    if (res.status !== 200) throw new Error("❌ whoami failed");

    const { user } = res.data;
    return { user, trip: null }; // whoami only returns user
  } catch (err) {
    console.error("💥 getUserAndTrip failed:", err);
    return { user: null, trip: null };
  }
};
