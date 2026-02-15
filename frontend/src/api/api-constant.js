export const API_BASE_URL = "http://localhost:4000";

export const API_ENDPOINTS = {
  auth: {
    profile: "/api/v1/auth/profile",
    login: "/api/v1/auth/login",
    logout: "/api/v1/auth/logout",
    changePassword: "/api/v1/auth/change-password"
  },
  content: {
    home: "/api/v1/content/home",
    adminHome: "/api/v1/content/admin/home",
    adminHomeSection: (sectionId) => `/api/v1/content/admin/home/${sectionId}`,
    uploadHomeLogo: "/api/v1/content/admin/home/logo"
  },
  dashboard: {
    myCourses: "/api/v1/courses/my"
  },
  teacher: {
    dashboard: "/api/v1/teacher/dashboard",
    assignTask: (courseId) => `/api/v1/teacher/courses/${courseId}/tasks`
  },
  student: {
    portal: "/api/v1/student/portal",
    submitHomework: (assignmentId) => `/api/v1/student/tasks/${assignmentId}/submit`,
    markNotificationRead: (notificationId) => `/api/v1/student/notifications/${notificationId}/read`
  },
  admin: {
    users: "/api/v1/admin/users",
    userById: (userId) => `/api/v1/admin/users/${userId}`,
    groups: "/api/v1/admin/groups",
    groupById: (groupId) => `/api/v1/admin/groups/${groupId}`,
    groupStudents: (groupId) => `/api/v1/admin/groups/${groupId}/students`,
    groupLiveSessions: (groupId) => `/api/v1/admin/groups/${groupId}/live-sessions`,
    groupLiveSessionById: (groupId, sessionId) =>
      `/api/v1/admin/groups/${groupId}/live-sessions/${sessionId}`,
    groupRecordings: (groupId) => `/api/v1/admin/groups/${groupId}/recordings`,
    groupRecordingById: (groupId, recordingId) =>
      `/api/v1/admin/groups/${groupId}/recordings/${recordingId}`
  }
};

