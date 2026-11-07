// src/utils/auth.js
// Shared helper — fetches current user or admin session from the backend via HTTP-only cookies.
// No data is stored in localStorage.

const API = "http://localhost:5000";

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
  } catch {
    return null;
  }
}

/**
 * Log out the current user by clearing the session cookie on the server.
 */
export async function logout() {
  try {
    await fetch(`${API}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // ignore network errors on logout
  }
}

/**
 * Check if client currently has an active Admin session
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
  } catch {
    return null;
  }
}

/**
 * Log in to Admin portal
 */
export async function adminLogin(email, password) {
  const res = await fetch(`${API}/api/auth/admin-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

/**
 * Log out of Admin portal
 */
export async function adminLogout() {
  try {
    await fetch(`${API}/api/auth/admin-logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // ignore
  }
}
