// utils/auth.js
import { auth } from "../firebase";

/**
 * Get Firebase authentication token with proper auth state waiting
 * @returns {Promise<string>} Firebase ID token
 */
export async function getAuthToken() {
  // Wait for Firebase auth to be ready (same pattern as LocalUniversalRouter)
  await new Promise(resolve => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe();
      resolve(user);
    });
  });

  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user");
  }
  return await user.getIdToken();
}

/**
 * Create axios config with authorization header
 * @returns {Promise<Object>} Axios config with Authorization header
 */
export async function getAuthConfig() {
  const token = await getAuthToken();
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
}
