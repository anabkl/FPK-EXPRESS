import { getAccessToken } from "../utils/session.js";


const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:8000" : "");

export class ApiError extends Error {
  constructor(message, status, details = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function request(path, options = {}) {
  if (!API_BASE_URL) {
    throw new ApiError("L'adresse du service API n'est pas configurée pour cette version.", 0);
  }
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let payload = {};
    try {
      payload = await response.json();
    } catch {
      payload = {};
    }
    throw new ApiError(
      typeof payload.detail === "string" ? payload.detail : "Le service est momentanément indisponible.",
      response.status,
      Array.isArray(payload.errors) ? payload.errors : [],
    );
  }

  if (response.status === 204) return null;
  return response.json();
}

function withQuery(path, params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") searchParams.set(key, value);
  });
  return searchParams.size ? `${path}?${searchParams}` : path;
}

export const api = {
  baseUrl: API_BASE_URL,
  register: (credentials) => request("/auth/register", { method: "POST", body: JSON.stringify(credentials) }),
  login: (credentials) => request("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  getMe: () => request("/auth/me"),
  getMeals: (params = {}) => request(withQuery("/meals", params)),
  getPartners: () => request("/partners"),
  getRecommendations: () => request("/ai/recommendations"),
  getPeakHours: () => request("/ai/peak-hours"),
  getOrders: () => request("/orders"),
  createOrder: (order) => request("/orders", { method: "POST", body: JSON.stringify(order) }),
  cancelOrder: (orderId) => request(`/orders/${orderId}/cancel`, { method: "POST" }),
  getVendorMeals: () => request("/vendor/meals"),
  getVendorOrders: () => request("/vendor/orders"),
  getVendorProfile: () => request("/vendor/profile"),
  getStats: () => request("/dashboard/stats"),
  createMeal: (meal) => request("/meals", { method: "POST", body: JSON.stringify(meal) }),
  updateMeal: (mealId, meal) => request(`/meals/${mealId}`, { method: "PATCH", body: JSON.stringify(meal) }),
  deleteMeal: (mealId) => request(`/meals/${mealId}`, { method: "DELETE" }),
  updatePartner: (isOpen) => request("/vendor/partner", { method: "PATCH", body: JSON.stringify({ is_open: isOpen }) }),
  updateOrderStatus: (orderId, status) => request(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  }),
  markOrderPaid: (orderId) => request(`/orders/${orderId}/payment`, {
    method: "PATCH",
    body: JSON.stringify({ status: "PaidOnPickup" }),
  }),
};
