// src/admin/utils/complianceApi.js
// Compliance Center API client.
// The compliance app is mounted at the project ROOT (/compliance/...), not under
// /admin-portal, so it needs its own axios instance with the same admin-token auth.
import axios from "axios";
import API_BASE_URL from "../../config";

export const complianceApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

complianceApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

complianceApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default complianceApi;
