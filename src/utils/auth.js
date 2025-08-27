// utils/auth.js
import { auth } from "../firebase";

/**
 * Get Firebase authentication token with proper auth state waiting
 * @returns {Promise<string>} Firebase ID token
 */
export async function getAuthToken() {
  // If we already have a current user, use it
  if (auth.currentUser) {
    return await auth.currentUser.getIdToken();
  }

  // Otherwise, wait for Firebase auth to be ready
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe();
      if (user) {
        try {
          const token = await user.getIdToken();
          resolve(token);
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error("No authenticated user"));
      }
    });
  });
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
