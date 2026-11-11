// src/utils/auth.js
// Shared helper — fetches current user or admin session from the backend via HTTP-only cookies.
// No data is stored in localStorage.


const API = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
  /\/$/,
  "",
);

/**
 * Get the currently logged-in user from the server session.
 */
export async function getCurrentUser() {
  try {
    const res = await fetch(`${API}/api/auth/me`, {
      credentials: "include",
    });

    const data = await res.json();

    if (data.success && data.user) {
      return data.user;
    }

    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Log out the current user.
 */
export async function logout() {
  try {
    await fetch(`${API}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout error:", error);
  }
}

/**
 * Check if there is an active Admin session.
 */
export async function getAdminSession() {
  try {
    const res = await fetch(`${API}/api/auth/admin-me`, {
      credentials: "include",
    });

    const data = await res.json();

    if (data.success && data.admin) {
      return data.admin;
    }

    return null;
  } catch (error) {
    console.error("Admin session error:", error);
    return null;
  }
}

/**
 * Log in to Admin portal.
 */
export async function adminLogin(email, password) {
  const res = await fetch(`${API}/api/auth/admin-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  return res.json();
}

/**
 * Log out of Admin portal.
 */
export async function adminLogout() {
  try {
    await fetch(`${API}/api/auth/admin-logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Admin logout error:", error);
  }
}
