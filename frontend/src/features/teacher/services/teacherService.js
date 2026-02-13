import { api } from "../../../api/client";

export async function fetchTeacherDashboard() {
  const response = await api.get("/api/teacher/dashboard");
  return response.data;
}

export async function assignHomeworkTask(courseId, payload) {
  return api.post(`/api/teacher/courses/${courseId}/tasks`, payload);
}
