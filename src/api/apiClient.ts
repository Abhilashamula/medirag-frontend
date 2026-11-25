
import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api",
  timeout: 60000,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    return Promise.reject(new Error(message));
  }
);

export default apiClient;
