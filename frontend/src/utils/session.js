export const TOKEN_STORAGE_KEY = "fpk-express-access-token";
export const LEGACY_ROLE_STORAGE_KEY = "fpk-express-role";
export const VALID_ROLES = ["student", "vendor"];

function getSessionStorage() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function normalizeRole(role) {
  const value = String(role || "").trim().toLowerCase();
  return VALID_ROLES.includes(value) ? value : null;
}

export function getAccessToken() {
  return getSessionStorage()?.getItem(TOKEN_STORAGE_KEY) || null;
}

export function setAccessToken(token) {
  const normalizedToken = String(token || "").trim();
  if (!normalizedToken) {
    clearSession();
    return null;
  }
  getSessionStorage()?.setItem(TOKEN_STORAGE_KEY, normalizedToken);
  clearLegacyRoleSession();
  return normalizedToken;
}

export function clearLegacyRoleSession() {
  try {
    window.localStorage.removeItem(LEGACY_ROLE_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in restrictive browser contexts.
  }
}

export function clearSession() {
  getSessionStorage()?.removeItem(TOKEN_STORAGE_KEY);
  clearLegacyRoleSession();
}

export function isStudent(role) {
  return normalizeRole(role) === "student";
}

export function isVendor(role) {
  return normalizeRole(role) === "vendor";
}
