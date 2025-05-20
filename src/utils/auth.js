// src/utils/auth.js

/**
 * Get authenticated user data from localStorage
 * @returns {Object|null} The user data object or null if not authenticated
 */
export function getUserData() {
  if (typeof window !== "undefined") {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (userData && token) {
      try {
        return {
          userData: JSON.parse(userData),
          token: token,
        };
      } catch (error) {
        console.error("Error parsing user data:", error);
        return null;
      }
    }
  }
  return null;
}
