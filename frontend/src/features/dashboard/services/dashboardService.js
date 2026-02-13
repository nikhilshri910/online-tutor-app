import { api } from "../../../api/client";

const DASHBOARD_ENDPOINTS = {
  myCourses: "/api/courses/my"
};

export async function fetchMyCourses() {
  const response = await api.get(DASHBOARD_ENDPOINTS.myCourses);
  return response.data.courses || [];
}
