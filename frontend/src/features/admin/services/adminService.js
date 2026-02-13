import { api } from "../../../api/client";

const ADMIN_ENDPOINTS = {
  users: "/api/admin/users",
  groups: "/api/admin/groups"
};

export async function fetchAdminUsers() {
  const response = await api.get(ADMIN_ENDPOINTS.users);
  return response.data.users || [];
}

export async function fetchAdminGroups() {
  const response = await api.get(ADMIN_ENDPOINTS.groups);
  return response.data.groups || [];
}

export async function createAdminUser(payload) {
  return api.post(ADMIN_ENDPOINTS.users, payload);
}

export async function updateAdminUser(userId, payload) {
  return api.put(`${ADMIN_ENDPOINTS.users}/${userId}`, payload);
}

export async function deleteAdminUser(userId) {
  return api.delete(`${ADMIN_ENDPOINTS.users}/${userId}`);
}

export async function createAdminGroup(payload) {
  return api.post(ADMIN_ENDPOINTS.groups, payload);
}

export async function updateAdminGroup(groupId, payload) {
  return api.put(`${ADMIN_ENDPOINTS.groups}/${groupId}`, payload);
}

export async function deleteAdminGroup(groupId) {
  return api.delete(`${ADMIN_ENDPOINTS.groups}/${groupId}`);
}

export async function addAllStudentsToAdminGroup(groupId) {
  return api.post(`${ADMIN_ENDPOINTS.groups}/${groupId}/students`, { includeAllStudents: true });
}

export async function createAdminGroupSession(groupId, payload) {
  return api.post(`${ADMIN_ENDPOINTS.groups}/${groupId}/live-sessions`, payload);
}

export async function updateAdminGroupSession(groupId, sessionId, payload) {
  return api.put(`${ADMIN_ENDPOINTS.groups}/${groupId}/live-sessions/${sessionId}`, payload);
}

export async function deleteAdminGroupSession(groupId, sessionId) {
  return api.delete(`${ADMIN_ENDPOINTS.groups}/${groupId}/live-sessions/${sessionId}`);
}

export async function createAdminGroupRecording(groupId, payload) {
  return api.post(`${ADMIN_ENDPOINTS.groups}/${groupId}/recordings`, payload);
}

export async function updateAdminGroupRecording(groupId, recordingId, payload) {
  return api.put(`${ADMIN_ENDPOINTS.groups}/${groupId}/recordings/${recordingId}`, payload);
}

export async function deleteAdminGroupRecording(groupId, recordingId) {
  return api.delete(`${ADMIN_ENDPOINTS.groups}/${groupId}/recordings/${recordingId}`);
}
