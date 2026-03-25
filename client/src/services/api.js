import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Auth ─────────────────────────────────────────────────────
export const authAPI = {
  register: (data)               => api.post("/auth/register", data),
  login: (data)                  => api.post("/auth/login", data),
  getMe: ()                      => api.get("/auth/me"),
  createHousehold: (data)        => api.post("/auth/household/create", data),
  joinHousehold: (data)          => api.post("/auth/household/join", data),
};

// ── Chores ───────────────────────────────────────────────────
export const choresAPI = {
  getAll: ()          => api.get("/chores"),
  create: (data)      => api.post("/chores", data),
  update: (id, data)  => api.put(`/chores/${id}`, data),
  delete: (id)        => api.delete(`/chores/${id}`),
  complete: (id)      => api.post(`/chores/${id}/complete`),
};

// ── Households ───────────────────────────────────────────────
export const householdsAPI = {
  getMyHousehold: () => api.get("/households/me"),
  getLeaderboard: () => api.get("/households/leaderboard"),
};

// ── Notifications ────────────────────────────────────────────
export const notificationsAPI = {
  getAll:     () => api.get("/notifications"),
  markAllRead: () => api.put("/notifications/read"),
};
