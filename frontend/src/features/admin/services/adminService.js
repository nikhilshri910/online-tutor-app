import { api } from "../../../api/client";
import { API_ENDPOINTS } from "../../../api/api-constant";

export async function fetchAdminUsers() {
  const response = await api.get(API_ENDPOINTS.admin.users);
  return response.data.users || [];
}

export async function fetchAdminGroups() {
  const response = await api.get(API_ENDPOINTS.admin.groups);
  return response.data.groups || [];
}

export async function createAdminUser(payload) {
  return api.post(API_ENDPOINTS.admin.users, payload);
}

export async function updateAdminUser(userId, payload) {
  return api.put(API_ENDPOINTS.admin.userById(userId), payload);
}

export async function deleteAdminUser(userId) {
  return api.delete(API_ENDPOINTS.admin.userById(userId));
}

export async function createAdminGroup(payload) {
  return api.post(API_ENDPOINTS.admin.groups, payload);
}

export async function updateAdminGroup(groupId, payload) {
  return api.put(API_ENDPOINTS.admin.groupById(groupId), payload);
}

export async function deleteAdminGroup(groupId) {
  return api.delete(API_ENDPOINTS.admin.groupById(groupId));
}

export async function addAllStudentsToAdminGroup(groupId) {
  return api.post(API_ENDPOINTS.admin.groupStudents(groupId), { includeAllStudents: true });
}

export async function createAdminGroupSession(groupId, payload) {
  return api.post(API_ENDPOINTS.admin.groupLiveSessions(groupId), payload);
}

export async function updateAdminGroupSession(groupId, sessionId, payload) {
  return api.put(API_ENDPOINTS.admin.groupLiveSessionById(groupId, sessionId), payload);
}

export async function deleteAdminGroupSession(groupId, sessionId) {
  return api.delete(API_ENDPOINTS.admin.groupLiveSessionById(groupId, sessionId));
}

export async function createAdminGroupRecording(groupId, payload) {
  return api.post(API_ENDPOINTS.admin.groupRecordings(groupId), payload);
}

export async function updateAdminGroupRecording(groupId, recordingId, payload) {
  return api.put(API_ENDPOINTS.admin.groupRecordingById(groupId, recordingId), payload);
}

export async function deleteAdminGroupRecording(groupId, recordingId) {
  return api.delete(API_ENDPOINTS.admin.groupRecordingById(groupId, recordingId));
}
