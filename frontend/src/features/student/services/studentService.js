import { api } from "../../../api/client";
import { API_ENDPOINTS } from "../../../api/api-constant";

export async function fetchStudentPortal() {
  const response = await api.get(API_ENDPOINTS.student.portal);
  return response.data;
}

export async function submitStudentHomework(assignmentId, payload) {
  return api.post(API_ENDPOINTS.student.submitHomework(assignmentId), payload);
}

export async function markStudentNotificationRead(notificationId) {
  return api.put(API_ENDPOINTS.student.markNotificationRead(notificationId));
}
