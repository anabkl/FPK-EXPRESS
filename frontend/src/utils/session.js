export const ROLE_STORAGE_KEY = "fpk-express-role";
export const VALID_ROLES = ["student", "vendor"];

function getStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function normalizeRole(role) {
  const value = String(role || "").trim().toLowerCase();
  return VALID_ROLES.includes(value) ? value : null;
}

export function getCurrentRole() {
  const storage = getStorage();
  if (!storage) return null;

  const role = normalizeRole(storage.getItem(ROLE_STORAGE_KEY));
  if (!role) storage.removeItem(ROLE_STORAGE_KEY);
  return role;
}

export function setCurrentRole(role) {
  const storage = getStorage();
  const normalizedRole = normalizeRole(role);
  if (!storage || !normalizedRole) {
    clearSession();
    return null;
  }

  storage.setItem(ROLE_STORAGE_KEY, normalizedRole);
  return normalizedRole;
}

export function clearSession() {
  const storage = getStorage();
  storage?.clear();
}

export function isStudent(role = getCurrentRole()) {
  return normalizeRole(role) === "student";
}

export function isVendor(role = getCurrentRole()) {
  return normalizeRole(role) === "vendor";
}
