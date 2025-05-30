import axios from "axios";
import { API_ENDPOINTS } from "./apiConfig";

const apiClient = axios.create({
  baseURL: API_ENDPOINTS.BaseUrl, 
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(
    (config) => {
      const token = sessionStorage.getItem("token"); 
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        window.location.href = "/login"; 
      }
      return Promise.reject(error);
    }
  );
export default apiClient;
