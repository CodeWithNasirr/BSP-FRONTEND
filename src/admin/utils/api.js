// src/utils/api.js
// Admin portal API configuration
import API_BASE_URL from "../../config";


export default API_BASE_URL;

// Axios instance with token injection
import axios from "axios";

export const adminApi = axios.create({
  baseURL: `${API_BASE_URL}/admin-portal`,
  headers: { "Content-Type": "application/json" },
});


adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
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