/**
 * RetinaGuard Unified API Service
 * Connects frontend to Express/PostgreSQL/ONNX backend.
 */

const RAW_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";

// Ensure API base has no trailing slash and cleanly handles /api
const CLEAN_BASE = RAW_URL.replace(/\/+$/, "");
export const API_BASE_URL = CLEAN_BASE.endsWith("/api")
  ? CLEAN_BASE
  : `${CLEAN_BASE}/api`;

export const SERVER_ROOT_URL = CLEAN_BASE.replace(/\/api$/, "");

async function handleResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  let data = null;
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = { error: await res.text() };
  }

  if (!res.ok) {
    const errorMsg =
      (data && data.error) ||
      (data && data.message) ||
      `Request failed with status ${res.status}`;
    const err = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  /**
   * Health Check
   */
  async checkHealth() {
    try {
      const res = await fetch(`${SERVER_ROOT_URL}/health`);
      return await handleResponse(res);
    } catch (err) {
      return { status: "offline", error: err.message };
    }
  },

  /**
   * Get all screenings
   */
  async getScreenings() {
    const res = await fetch(`${API_BASE_URL}/screenings`);
    return await handleResponse(res);
  },

  /**
   * Get screening by ID
   */
  async getScreening(id) {
    const res = await fetch(`${API_BASE_URL}/screenings/${id}`);
    return await handleResponse(res);
  },

  /**
   * Upload retinal scan image & patient metadata
   * @param {FormData} formData
   */
  async uploadScreening(formData) {
    const res = await fetch(`${API_BASE_URL}/screenings/upload`, {
      method: "POST",
      body: formData,
    });
    return await handleResponse(res);
  },

  /**
   * Trigger AI inference processing for a scan
   * @param {number|string} id
   */
  async processScreening(id) {
    const res = await fetch(`${API_BASE_URL}/screenings/${id}/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    return await handleResponse(res);
  },

  /**
   * Register operator
   */
  async registerOperator(payload) {
    const res = await fetch(`${API_BASE_URL}/register/operator`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await handleResponse(res);
  },

  /**
   * Register doctor / ophthalmologist
   */
  async registerDoctor(payload) {
    const res = await fetch(`${API_BASE_URL}/register/doctor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await handleResponse(res);
  },

  /**
   * Login user against PostgreSQL database
   */
  async login(email, password, role) {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    return await handleResponse(res);
  },

  /**
   * Sync Clerk authenticated user with database
   */
  async syncClerkUser(payload) {
    const res = await fetch(`${API_BASE_URL}/auth/clerk-sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await handleResponse(res);
  },
};

export default api;
