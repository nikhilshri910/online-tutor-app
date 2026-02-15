import { api } from "../../api/client";
import { API_ENDPOINTS } from "../../api/api-constant";

export async function fetchHomeContent() {
  const response = await api.get(API_ENDPOINTS.content.home);
  return response.data?.content || null;
}

export async function saveHomeContent(content) {
  const response = await api.put(API_ENDPOINTS.content.adminHomeSection("branding"), {
    payload: content?.appMeta || {}
  });
  return response.data;
}

export async function fetchAdminHomeContent() {
  const response = await api.get(API_ENDPOINTS.content.adminHome);
  return response.data?.content || null;
}

export async function updateHomeContentSection(sectionId, payload) {
  const response = await api.put(API_ENDPOINTS.content.adminHomeSection(sectionId), { payload });
  return response.data;
}

export async function uploadHomeLogo(file) {
  const dataBase64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const base64 = result.includes(",") ? result.split(",")[1] : "";
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const response = await api.post(API_ENDPOINTS.content.uploadHomeLogo, {
    fileName: file.name,
    mimeType: file.type,
    dataBase64
  });
  return response.data;
}

