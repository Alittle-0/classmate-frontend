import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";

const getBaseURL = () => {
  if (import.meta.env.MODE === "development") {
    return import.meta.env.VITE_DEV_URL || "/api";
  }
  // Production: use environment variable or fallback to /api
  return import.meta.env.VITE_API_URL || "/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (
      originalRequest.url.includes("/v1/identity/auth/register") ||
      originalRequest.url.includes("/v1/identity/auth/login") ||
      originalRequest.url.includes("/v1/identity/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retryCount = originalRequest._retryCount || 0;

    if (error.response?.status === 403 && originalRequest._retryCount < 4) {
      originalRequest._retryCount += 1;
      try {
        const response = await api.post(
          "/v1/identity/auth/refresh",
          {},
          { withCredentials: true },
        );
        const newAccessToken = response.data.access_token;

        useAuthStore.getState().setAccessToken(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearState();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
