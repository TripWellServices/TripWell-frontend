// utils/auth.js
import { auth } from "../firebase";

/**
 * Get Firebase authentication token with error handling
 * @returns {Promise<string>} Firebase ID token
 * @throws {Error} If no authenticated user
 */
export async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user");
  }
  return await user.getIdToken();
}

/**
 * Get Firebase authentication token with force refresh
 * @returns {Promise<string>} Firebase ID token
 * @throws {Error} If no authenticated user
 */
export async function getAuthTokenForceRefresh() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user");
  }
  return await user.getIdToken(true);
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

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export function isAuthenticated() {
  return !!auth.currentUser;
}

/**
 * Get current user
 * @returns {Object|null} Firebase user object or null
 */
export function getCurrentUser() {
  return auth.currentUser;
}
