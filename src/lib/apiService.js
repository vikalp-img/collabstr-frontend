import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// One-off helper so we only touch browser APIs when they exist.
const isBrowser = typeof window !== 'undefined';

const logoutAndRedirect = () => {
  if (!isBrowser) return;
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  window.location.href = '/login';
};

// Common 401 handler shared by both clients.
const onResponseError = (error) => {
  const status = error?.response?.status;
  if (status === 401) {
    logoutAndRedirect();
  }
  return Promise.reject(error);
};

// Public client: no auth header attached.
export const apiWithoutAuth = axios.create({
  baseURL: BASE_URL,
});

// Authenticated client: inject bearer token when present.
export const apiWithAuth = axios.create({
  baseURL: BASE_URL,
});

apiWithAuth.interceptors.request.use((config) => {
  if (isBrowser) {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiWithAuth.interceptors.response.use(
  (response) => response,
  onResponseError,
);

apiWithoutAuth.interceptors.response.use(
  (response) => response,
  onResponseError,
);

export default {
  withAuth: apiWithAuth,
  withoutAuth: apiWithoutAuth,
};
