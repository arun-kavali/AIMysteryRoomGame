import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const http = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000, // Generous timeout for AI mystery generation
});

// Response interceptor for consistent error extraction
http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message:
        error.response?.data?.error?.message ||
        error.message ||
        'An unexpected error occurred while communicating with the investigation server.',
      code: error.response?.data?.error?.code || 'NETWORK_ERROR',
      status: error.response?.status || 500,
    };
    return Promise.reject(customError);
  }
);

export default http;
