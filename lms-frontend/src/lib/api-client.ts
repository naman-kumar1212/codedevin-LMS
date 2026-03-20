import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true, // send cookies
  headers: { 'Content-Type': 'application/json' },
});

// Auto-refresh access token on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        await axios.post(`${API_URL}/api/auth/refresh`, {}, { withCredentials: true });
        return apiClient(original);
      } catch {
        // Refresh failed – redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

// Typed helpers
export const api = {
  // Auth
  register: (data: { name: string; email: string; password: string }) =>
    apiClient.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  verifyEmail: (token: string) => apiClient.get(`/auth/verify/${token}`),
  me: () => apiClient.get('/users/me'),

  // Courses
  getCourses: (params?: { search?: string; type?: string }) =>
    apiClient.get('/courses', { params }),
  getCourse: (id: string) => apiClient.get(`/courses/${id}`),
  getCourseAccess: (id: string) => apiClient.get(`/courses/${id}/access`),

  // Enrollment
  enrollFree: (courseId: string) => apiClient.post(`/courses/${courseId}/enroll`),
  getMyCourses: () => apiClient.get('/students/me/courses'),

  // Payments
  createPayment: (courseId: string) => apiClient.post('/payments/create', { courseId }),

  // Progress
  trackVideo: (lessonId: string, watchedPercentage: number) =>
    apiClient.post('/progress/video', { lessonId, watchedPercentage }),
  markResourceComplete: (lessonId: string) =>
    apiClient.post('/progress/resource', { lessonId }),
  getCourseProgress: (courseId: string) =>
    apiClient.get(`/progress/courses/${courseId}`),
  getAdminCoursePreview: (courseId: string) =>
    apiClient.get(`/progress/courses/${courseId}/admin`),

  // Admin
  adminStats: () => apiClient.get('/admin/dashboard/stats'),
  adminStudents: (search?: string) =>
    apiClient.get('/admin/students', { params: { search } }),
  getStudentDetails: (id: string) =>
    apiClient.get(`/admin/students/${id}`),
  adminPayments: () => apiClient.get('/payments'),
  adminCertificates: () => apiClient.get('/admin/certificates'),

  // Admin Courses
  adminCourses: () => apiClient.get('/courses/admin/all'),
  createCourse: (data: any) => apiClient.post('/courses', data),
  updateCourse: (id: string, data: any) => apiClient.patch(`/courses/${id}`, data),
  publishCourse: (id: string) => apiClient.patch(`/courses/${id}/publish`),
  archiveCourse: (id: string) => apiClient.patch(`/courses/${id}/archive`),
  deleteCourse: (id: string) => apiClient.delete(`/courses/${id}`),

  createModule: (courseId: string, data: any) => 
    apiClient.post(`/courses/${courseId}/modules`, data),
  updateModule: (moduleId: string, data: any) => 
    apiClient.patch(`/courses/modules/${moduleId}`, data),
  deleteModule: (moduleId: string) => 
    apiClient.delete(`/courses/modules/${moduleId}`),
  reorderModules: (courseId: string, items: Array<{id: string; orderIndex: number}>) =>
    apiClient.patch(`/courses/${courseId}/modules/reorder`, { items }),

  // Lessons
  createLesson: (moduleId: string, data: any) => 
    apiClient.post(`/courses/modules/${moduleId}/lessons`, data),
  updateLesson: (lessonId: string, data: any) => 
    apiClient.patch(`/courses/lessons/${lessonId}`, data),
  deleteLesson: (lessonId: string) => 
    apiClient.delete(`/courses/lessons/${lessonId}`),
  reorderLessons: (moduleId: string, items: Array<{id: string; orderIndex: number}>) =>
    apiClient.patch(`/courses/modules/${moduleId}/lessons/reorder`, { items }),

  // Student specific
  getMyCertificates: () => apiClient.get('/students/me/certificates'),
  getMyNotifications: (page = 1, limit = 20) =>
    apiClient.get('/notifications', { params: { page, limit } }),
  getUnreadNotificationsCount: () => apiClient.get('/notifications/unread-count'),
  markNotificationRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllNotificationsRead: () => apiClient.patch('/notifications/read-all'),

  // Live Classes
  getLiveClasses: () => apiClient.get('/live-classes'),
  getAdminLiveClasses: () => apiClient.get('/live-classes/admin'),
  createLiveClass: (data: {
    courseId: string;
    title: string;
    scheduledAt: string;
    durationMinutes: number;
  }) => apiClient.post('/live-classes', data),
  attachRecording: (classId: string, recordingUrl: string) =>
    apiClient.patch(`/live-classes/${classId}/recording`, { recordingUrl }),

  // Quizzes
  getQuizForLesson: (lessonId: string) => apiClient.get(`/lessons/${lessonId}/quiz`),
  submitQuizAttempt: (quizId: string, answers: Record<string, string>) =>
    apiClient.post(`/quizzes/${quizId}/attempt`, { answers }),
  createQuiz: (lessonId: string, data: { title: string; passingScore: number }) =>
    apiClient.post(`/lessons/${lessonId}/quiz`, data),

  // Certificate verify (public)
  verifyCertificate: (code: string) => apiClient.get(`/certificates/verify/${code}`),

  // Videos (mock)
  getVideoUploadUrl: (filename: string) => apiClient.post('/videos/upload-url', { filename }),
  getVideoStatus: (videoId: string) => apiClient.get(`/videos/${videoId}/status`),

  // Media uploads — structured for future presigned URL migration
  uploadVideo: (
    lessonId: string,
    file: File,
    meta: { title?: string; description?: string },
    onProgress?: (pct: number) => void,
  ) => {
    const form = new FormData();
    form.append('file', file);
    if (meta.title) form.append('title', meta.title);
    if (meta.description) form.append('description', meta.description);
    return apiClient.post(`/media/upload/video/${lessonId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
        ? (e) => onProgress(Math.round((e.loaded * 100) / (e.total ?? 1)))
        : undefined,
    });
  },
  uploadPDF: (
    lessonId: string,
    file: File,
    meta: { title?: string; learningOutcome?: string },
    onProgress?: (pct: number) => void,
  ) => {
    const form = new FormData();
    form.append('file', file);
    if (meta.title) form.append('title', meta.title);
    if (meta.learningOutcome) form.append('learningOutcome', meta.learningOutcome);
    return apiClient.post(`/media/upload/pdf/${lessonId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
        ? (e) => onProgress(Math.round((e.loaded * 100) / (e.total ?? 1)))
        : undefined,
    });
  },

  // Lesson metadata (after upload)
  updateLessonMeta: (
    lessonId: string,
    data: { title?: string; description?: string; thumbnail?: string; learningOutcome?: string },
  ) => apiClient.patch(`/media/meta/${lessonId}`, data),

  // Draft autosave (Redis-backed)
  saveDraft: (courseId: string, data: Record<string, unknown>) =>
    apiClient.post(`/drafts/course/${courseId}`, data),
  getDraft: (courseId: string) => apiClient.get(`/drafts/course/${courseId}`),
  clearDraft: (courseId: string) => apiClient.delete(`/drafts/course/${courseId}`),

  // Module-level quizzes
  createModuleQuiz: (moduleId: string, data: { title: string; passingScore: number }) =>
    apiClient.post(`/quizzes/module/${moduleId}`, data),
  updateModuleQuiz: (quizId: string, data: { title?: string; passingScore?: number }) =>
    apiClient.patch(`/quizzes/${quizId}`, data),
};

