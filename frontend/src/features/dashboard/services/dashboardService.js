import { api } from "../../../api/client";
import { API_ENDPOINTS } from "../../../api/api-constant";

export async function fetchMyCourses() {
  const response = await api.get(API_ENDPOINTS.dashboard.myCourses);
  return response.data.courses || [];
}
