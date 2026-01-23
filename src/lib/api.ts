import { RecordPaymentData } from "@/types";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("auth-storage");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    const message = error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  getMe: () => api.get("/auth/me"),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post("/auth/change-password", { currentPassword, newPassword }),
};

// Leads API
export const leadsApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/admin/leads", { params }),

  getById: (id: string) =>
    api.get(`/admin/leads/${id}`),

  updateStatus: (id: string, status: string) =>
    api.patch(`/admin/leads/${id}/status`, { status }),

  assign: (id: string, userId: string) =>
    api.patch(`/admin/leads/${id}/assign`, { userId }),

  reassign: (id: string, userId: string) =>
    api.patch(`/admin/leads/${id}/reassign`, { userId }),

  autoAssign: (teamId?: string, limit?: number) =>
    api.post("/admin/leads/auto-assign", { teamId, limit }),

  addNote: (id: string, content: string) =>
    api.post(`/admin/leads/${id}/notes`, { content }),

  getStats: (params?: Record<string, unknown>) =>
    api.get("/admin/leads/stats", { params }),

  export: (params?: Record<string, unknown>) =>
    api.get("/admin/leads/export", { params, responseType: "blob" }),
};

// Users API
export const usersApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/admin/users", { params }),

  getById: (id: string) =>
    api.get(`/admin/users/${id}`),

  getSalesUsers: () =>
    api.get("/admin/users/sales"),

  create: (data: Record<string, unknown>) =>
    api.post("/admin/users", data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/admin/users/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/users/${id}`),

  resetPassword: (id: string) =>
    api.post(`/admin/users/${id}/reset-password`),
};

// Teams API
export const teamsApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/admin/teams", { params }),

  getActive: () =>
    api.get("/admin/teams/active"),

  getById: (id: string) =>
    api.get(`/admin/teams/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post("/admin/teams", data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/admin/teams/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/teams/${id}`),

  addMember: (teamId: string, userId: string) =>
    api.post(`/admin/teams/${teamId}/members`, { userId }),

  removeMember: (teamId: string, userId: string) =>
    api.delete(`/admin/teams/${teamId}/members/${userId}`),
};

// Admissions API
export const admissionsApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/admin/admissions", { params }),

  getById: (id: string) =>
    api.get(`/admin/admissions/${id}`),

  getStats: () =>
    api.get("/admin/admissions/stats"),

  recordPayment: (id: string, data: RecordPaymentData) =>
    api.post(`/admin/admissions/${id}/payment`, data),
};

export default api;