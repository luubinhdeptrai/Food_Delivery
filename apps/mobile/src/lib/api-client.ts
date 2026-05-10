import Constants from 'expo-constants';
const getBaseUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(':')[0] || 'localhost';
  return `http://${localhost}:3000`.replace(/\/+$/, '');
};

export const BASE_URL = getBaseUrl();

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${normalizedEndpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    let errorMessage = `API error: ${response.status}`;
    let bodyText = '';
    
    try {
      bodyText = await response.text();
      if (isJson && bodyText) {
        const errorData = JSON.parse(bodyText);
        errorMessage = errorData.message || errorMessage;
      }
    } catch (e) {
      errorMessage = `${errorMessage} (Failed to parse error body)`;
    }
    
    throw new Error(`${errorMessage}\nStatus: ${response.status}\nBody: ${bodyText}`);
  }

  if (isJson) {
    return response.json();
  }
  
  const textBody = await response.text();
  return textBody as any;
}
