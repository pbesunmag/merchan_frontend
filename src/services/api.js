// Configuración centralizada: las URLs se inyectan desde .env (VITE_API_BASE_URL / VITE_WS_URL)
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
export const WS_URL = import.meta.env.VITE_WS_URL || '';

if (!API_BASE_URL) {
  console.error('[Stark Config] Falta VITE_API_BASE_URL en el fichero .env');
}
if (!WS_URL) {
  console.error('[Stark Config] Falta VITE_WS_URL en el fichero .env');
}

const MENSAJE_SIN_CONEXION =
  'No se pudo conectar con el servidor backend (verifica que esté encendido y que VITE_API_BASE_URL sea correcta).';

// Extrae el mensaje real del backend (DTO de error personalizado)
async function extraerMensajeError(response) {
  const errorData = await response.json().catch(() => null);
  const mensajeBackend =
    errorData?.message ||
    errorData?.mensaje ||
    errorData?.error ||
    errorData?.detail ||
    (Array.isArray(errorData?.errors) ? errorData.errors[0]?.defaultMessage || errorData.errors[0] : null);

  return mensajeBackend || `Error ${response.status}: ${response.statusText}`;
}

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
    response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  } catch {
    throw new Error(MENSAJE_SIN_CONEXION);
  }

  if (!response.ok) {
    throw new Error(await extraerMensajeError(response));
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
    response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  } catch {
    throw new Error(MENSAJE_SIN_CONEXION);
  }

  if (!response.ok) {
    throw new Error(await extraerMensajeError(response));
  }

  return response.blob();
}
