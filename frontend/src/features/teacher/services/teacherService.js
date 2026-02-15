import { api } from "../../../api/client";
import { API_ENDPOINTS } from "../../../api/api-constant";

export async function fetchTeacherDashboard() {
  const response = await api.get(API_ENDPOINTS.teacher.dashboard);
  return response.data;
}

export async function assignHomeworkTask(courseId, payload) {
  return api.post(API_ENDPOINTS.teacher.assignTask(courseId), payload);
}
