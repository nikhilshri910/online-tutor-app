import { api } from "../../../api/client";

export async function fetchStudentPortal() {
  const response = await api.get("/api/student/portal");
  return response.data;
}

export async function submitStudentHomework(assignmentId, payload) {
  return api.post(`/api/student/tasks/${assignmentId}/submit`, payload);
}

export async function markStudentNotificationRead(notificationId) {
  return api.put(`/api/student/notifications/${notificationId}/read`);
}
