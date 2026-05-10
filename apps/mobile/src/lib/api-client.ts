import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const getBaseUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(':')[0] || 'localhost';
  // Use localhost:3000 as requested, but fall back to detected IP for physical devices
  return `http://${localhost}:3000`;
};

export const BASE_URL = getBaseUrl();

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  // Try to get the session token from SecureStore if it exists
  // Better-auth uses its own storage, but we can try to intercept or 
  // just rely on the fact that some endpoints might be public.
  // For now, let's just do a basic fetch.
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  return response.json();
}
