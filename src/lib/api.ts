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

// Learning Platform API
export const coursesApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/admin/courses", { params }),

  getById: (id: string) =>
    api.get(`/admin/courses/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post("/admin/courses", data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/admin/courses/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/courses/${id}`),
};

export const chaptersApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/admin/chapters", { params }),

  getByCourse: (courseId: string) =>
    api.get(`/admin/chapters/course/${courseId}`),

  getById: (id: string) =>
    api.get(`/admin/chapters/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post("/admin/chapters", data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/admin/chapters/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/chapters/${id}`),
};

export const questionsApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/admin/questions", { params }),

  getByChapter: (chapterId: string) =>
    api.get(`/admin/questions/chapter/${chapterId}`),

  getById: (id: string) =>
    api.get(`/admin/questions/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post("/admin/questions", data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/admin/questions/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/questions/${id}`),
};

export const contentApi = {
  uploadVideo: (file: File) => {
    const formData = new FormData();
    formData.append('video', file);
    return api.post("/admin/content/upload/video", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadNotes: (file: File, courseId: string, chapterNumber: number) => {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('courseId', courseId);
    formData.append('chapterNumber', chapterNumber.toString());
    return api.post("/admin/content/upload/notes", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadQuestionImage: (file: File, questionId: string) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('questionId', questionId);
    return api.post("/admin/content/upload/question-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const notificationTemplatesApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/admin/notification-templates", { params }),

  getById: (id: string) =>
    api.get(`/admin/notification-templates/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post("/admin/notification-templates", data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/admin/notification-templates/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/notification-templates/${id}`),
};

export default api;