import { Plan, Subject, Chapter, Topic, Question, NotificationTemplate, Blog, News, Course } from "@/types";
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
// Plans API
export const plansApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/admin/plans", { params }),

  getById: (id: string) =>
    api.get(`/admin/plans/${id}`),

  create: (data: Partial<Plan>) =>
    api.post("/admin/plans", data),

  update: (id: string, data: Partial<Plan>) =>
    api.patch(`/admin/plans/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/plans/${id}`),
};

// Subjects API
export const subjectsApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/admin/subjects", { params }),

  getByPlan: (planId: string, classFilter?: string) =>
    api.get(`/admin/subjects/plan/${planId}`, {
      params: classFilter ? { class: classFilter } : undefined,
    }),

  getById: (id: string) =>
    api.get(`/admin/subjects/${id}`),

  create: (data: Partial<Subject>) =>
    api.post("/admin/subjects", data),

  update: (id: string, data: Partial<Subject>) =>
    api.patch(`/admin/subjects/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/subjects/${id}`),
};

// Chapters API (updated)
export const chaptersApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/admin/chapters", { params }),

  getBySubject: (subjectId: string) =>
    api.get(`/admin/chapters/subject/${subjectId}`),

  getById: (id: string) =>
    api.get(`/admin/chapters/${id}`),

  create: (data: Partial<Chapter>) =>
    api.post("/admin/chapters", data),

  update: (id: string, data: Partial<Chapter>) =>
    api.patch(`/admin/chapters/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/chapters/${id}`),
};

// Topics API
export const topicsApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/admin/topics", { params }),

  getByChapter: (chapterId: string) =>
    api.get(`/admin/topics/chapter/${chapterId}`),

  getById: (id: string) =>
    api.get(`/admin/topics/${id}`),

  create: (data: Partial<Topic>) =>
    api.post("/admin/topics", data),

  update: (id: string, data: Partial<Topic>) =>
    api.patch(`/admin/topics/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/topics/${id}`),
};

// Questions API (updated)
export const questionsApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/admin/questions", { params }),

  getByChapter: (chapterId: string) =>
    api.get(`/admin/questions/chapter/${chapterId}`),

  getById: (id: string) =>
    api.get(`/admin/questions/${id}`),

  create: (data: Partial<Question>) =>
    api.post("/admin/questions", data),

  update: (id: string, data: Partial<Question>) =>
    api.patch(`/admin/questions/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/questions/${id}`),
};

// Content API (updated for topics)
export const contentApi = {
  uploadVideo: (file: File) => {
    const formData = new FormData();
    formData.append('video', file);
    return api.post("/admin/content/upload/video", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadNotes: (file: File, topicId: string) => {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('topicId', topicId);
    return api.post("/admin/content/upload/notes", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  createVideoUploadUrl: (fileName: string, fileSize: number, topicId: string) =>
    api.post("/admin/content/upload/video/start", { fileName, fileSize, topicId }),

  uploadNotesWithProgress: (
    file: File,
    topicId: string,
    onProgress: (pct: number) => void
  ) => {
    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("topicId", topicId);
    return new Promise<{ data: { data: { notesUrl: string } } }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL}/admin/content/upload/notes`);

      const token = localStorage.getItem("token");
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          const msg = JSON.parse(xhr.responseText)?.message || "Upload failed";
          reject(new Error(msg));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(formData);
    });
  },

  uploadChapterNotesWithProgress: (
    file: File,
    chapterId: string,
    onProgress: (pct: number) => void
  ) => {
    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("chapterId", chapterId);
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL}/admin/content/upload/chapter-notes`);
      const token = localStorage.getItem("token");
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(JSON.parse(xhr.responseText)?.message || "Upload failed"));
      };
      xhr.onerror = () => reject(new Error("Network error"));
      xhr.send(formData);
    });
  },

  uploadChapterAssessmentWithProgress: (
    file: File,
    chapterId: string,
    onProgress: (pct: number) => void
  ) => {
    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("chapterId", chapterId);
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL}/admin/content/upload/chapter-assessment`);
      const token = localStorage.getItem("token");
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(JSON.parse(xhr.responseText)?.message || "Upload failed"));
      };
      xhr.onerror = () => reject(new Error("Network error"));
      xhr.send(formData);
    });
  },

  getNotesSignedUrl: (s3Key: string) =>
    api.get("/admin/content/notes/signed-url", { params: { key: s3Key } }),

  uploadChapterNotes: (file: File, chapterId: string) => {
    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("chapterId", chapterId);
    return api.post("/admin/content/upload/chapter-notes", formData);
  },

  getChapterNotesSignedUrl: (s3Key: string) =>
    api.get("/admin/content/notes/signed-url", { params: { key: s3Key } }),
};

export const notificationTemplatesApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/admin/notification-templates", { params }),

  getById: (id: string) =>
    api.get(`/admin/notification-templates/${id}`),

  create: (data: Partial<NotificationTemplate>) =>
    api.post("/admin/notification-templates", data),

  update: (id: string, data: Partial<NotificationTemplate>) =>
    api.patch(`/admin/notification-templates/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/notification-templates/${id}`),
};

// Blogs API
export const blogsApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/admin/blogs", { params }),

  getById: (id: string) =>
    api.get(`/admin/blogs/id/${id}`),

  getPublished: () =>
    api.get("/blogs", { params: { limit: 100 } }),

  create: (data: Partial<Blog>) =>
    api.post("/admin/blogs", data),

  update: (id: string, data: Partial<Blog>) =>
    api.patch(`/admin/blogs/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/blogs/${id}`),

  uploadImage: (file: File, blogId: string, onProgress?: (pct: number) => void) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("blogId", blogId);

    return new Promise<{ imageUrl: string }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL}/admin/content/upload/blog-image`);

      const token = localStorage.getItem("token");
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      if (onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const res = JSON.parse(xhr.responseText);
          resolve({ imageUrl: res.data.imageUrl });
        } else {
          const msg = JSON.parse(xhr.responseText)?.message || "Upload failed";
          reject(new Error(msg));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(formData);
    });
  },
};

// News API
export const newsApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/admin/news", { params }),

  getById: (id: string) =>
    api.get(`/news/id/${id}`),

  getPublished: () =>
    api.get("/news", { params: { limit: 100 } }),

  create: (data: Partial<News>) =>
    api.post("/admin/news", data),

  update: (id: string, data: Partial<News>) =>
    api.patch(`/admin/news/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/news/${id}`),

  uploadImage: (file: File, newsId: string, onProgress?: (pct: number) => void) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("newsId", newsId);

    return new Promise<{ imageUrl: string }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL}/admin/content/upload/news-image`);

      const token = localStorage.getItem("token");
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      if (onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const res = JSON.parse(xhr.responseText);
          resolve({ imageUrl: res.data.imageUrl });
        } else {
          reject(new Error(JSON.parse(xhr.responseText)?.message || "Upload failed"));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(formData);
    });
  },
};

// Courses API
export const coursesApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/admin/courses", { params }),

  getById: (id: string) =>
    api.get(`/courses/id/${id}`),

  getByClass: (cls: string) =>
    api.get(`/courses/class/${cls}`),

  create: (data: Partial<Course>) =>
    api.post("/admin/courses", data),

  update: (id: string, data: Partial<Course>) =>
    api.patch(`/admin/courses/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/courses/${id}`),

  uploadImage: (file: File, courseId: string, onProgress?: (pct: number) => void) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("courseId", courseId);

    return new Promise<{ imageUrl: string }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL}/admin/content/upload/course-image`);

      const token = localStorage.getItem("token");
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      if (onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const res = JSON.parse(xhr.responseText);
          resolve({ imageUrl: res.data.imageUrl });
        } else {
          reject(new Error(JSON.parse(xhr.responseText)?.message || "Upload failed"));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(formData);
    });
  },
};

// Feedback API
export const feedbackApi = {
  // Sales feedback
  submitSalesFeedback: (data: Record<string, string>) =>
    api.post("/feedback/sales", data),

  getTodayStatus: () =>
    api.get("/feedback/sales/today"),

  getMySalesFeedback: () =>
    api.get("/feedback/sales/my"),

  getAllSalesFeedback: (params?: Record<string, unknown>) =>
    api.get("/feedback/sales", { params }),

  // Other feedback
  submitOtherFeedback: (message: string) =>
    api.post("/feedback/other", { message }),

  getMyOtherFeedback: () =>
    api.get("/feedback/other/my"),

  getAllOtherFeedback: (params?: Record<string, unknown>) =>
    api.get("/feedback/other", { params }),

  replyToOtherFeedback: (id: string, reply: string) =>
    api.patch(`/feedback/other/${id}/reply`, { reply }),

  // Dashboard
  getSalesDashboardStats: () =>
    api.get("/feedback/dashboard/stats"),
};

export const categoriesApi = {
  getAll: (params?: { includeInactive?: boolean }) =>
    api.get('/categories', { params }),

  create: (data: Partial<{ name: string; slug: string; description: string; order: number; isActive: boolean }>) =>
    api.post('/categories', data),

  update: (id: string, data: Partial<{ name: string; slug: string; description: string; order: number; isActive: boolean }>) =>
    api.patch(`/categories/${id}`, data),

  delete: (id: string) =>
    api.delete(`/categories/${id}`),
};

export const resourcePagesApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get('/admin/resource-pages', { params }),

  getById: (id: string) =>
    api.get(`/resource-pages/id/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post('/admin/resource-pages', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/admin/resource-pages/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/resource-pages/${id}`),

  uploadImage: (file: File, pageId: string, onProgress?: (pct: number) => void) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('pageId', pageId);

    return new Promise<{ imageUrl: string }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL}/admin/content/upload/resource-page-image`);

      const token = localStorage.getItem('token');
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      if (onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const res = JSON.parse(xhr.responseText);
          resolve({ imageUrl: res.data.imageUrl });
        } else {
          reject(new Error(JSON.parse(xhr.responseText)?.message || 'Upload failed'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(formData);
    });
  },
};

export default api;