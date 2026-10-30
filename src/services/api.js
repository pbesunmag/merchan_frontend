export const API_BASE_URL = 'http://localhost:8080/api';
const BASE_URL = API_BASE_URL;

export async function request(endpoint, options = {}) {
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, config);
  } catch {
    throw new Error('No se pudo conectar con el servidor backend (verifica que esté encendido en el puerto 8080).');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    
    // Extrae el mensaje real del backend (DTO de error personalizado)
    const mensajeBackend =
      errorData?.message ||
      errorData?.mensaje ||
      errorData?.error ||
      errorData?.detail ||
      (Array.isArray(errorData?.errors) ? errorData.errors[0]?.defaultMessage || errorData.errors[0] : null);

    const mensajeFinal = mensajeBackend || `Error ${response.status}: ${response.statusText}`;
    throw new Error(mensajeFinal);
  }

  if (response.status === 204) return null;

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

/**
 * Petición que devuelve un Blob (descargas de archivos como CSV).
 * Reutiliza el mismo manejo de errores que `request`.
 */
export async function requestBlob(endpoint, options = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, options);
  } catch {
    throw new Error('No se pudo conectar con el servidor backend (verifica que esté encendido en el puerto 8080).');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const mensajeBackend =
      errorData?.message || errorData?.mensaje || errorData?.error || errorData?.detail;
    throw new Error(mensajeBackend || `Error ${response.status}: ${response.statusText}`);
  }

  return response.blob();
}
