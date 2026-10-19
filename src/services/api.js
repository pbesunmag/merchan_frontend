const BASE_URL = 'http://localhost:8080/api';

export async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const mensaje = errorData?.message || `Error ${response.status}: ${response.statusText}`;
    throw new Error(mensaje);
  }

  if (response.status === 204) return null;

  return response.json();
}