// API configuration for MediMind
// In development, Vite proxy handles /api requests
// In production, we need the full URL to the backend

/// <reference types="vite/client" />

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '';

export const getApiUrl = (path: string): string => {
  // If path already starts with /api, just prepend the base URL
  if (path.startsWith('/api')) {
    return `${API_BASE_URL}${path}`;
  }
  // Otherwise, add /api prefix
  return `${API_BASE_URL}/api${path}`;
};

export default API_BASE_URL;
