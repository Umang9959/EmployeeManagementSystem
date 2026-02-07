import apiClient from "./apiClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const AUTH_API_BASE_URL = `${API_BASE_URL}/api/auth`;

export const loginUser = (payload) => apiClient.post(AUTH_API_BASE_URL + '/login', payload);

export const registerUser = (payload) => apiClient.post(AUTH_API_BASE_URL + '/register', payload);
