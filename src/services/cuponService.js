import { request } from './api';

export const cuponService = {
  // GET /api/cupones/destacado -> cupón destacado vigente o null (si 204 No Content)
  obtenerCuponDestacado: async () => {
    try {
      const data = await request('/cupones/destacado');
      if (!data || data.activo === false) {
        return null;
      }
      return data;
    } catch {
      return null;
    }
  },

  // POST /api/cupones/validar -> valida código de cupón y devuelve CuponDescuentoDTO
  validarCupon: (codigo) =>
    request('/cupones/validar', {
      method: 'POST',
      body: JSON.stringify({ codigo: String(codigo || '').trim().toUpperCase() }),
    }),

  // GET /api/cupones -> listado completo de cupones
  listarCupones: () => request('/cupones'),

  // POST /api/cupones -> crear nuevo cupón
  crearCupon: (datos) =>
    request('/cupones', {
      method: 'POST',
      body: JSON.stringify(datos),
    }),

  // PATCH /api/cupones/{id}/toggle -> activar o desactivar cupón
  toggleActivo: (id) =>
    request(`/cupones/${id}/toggle`, {
      method: 'PATCH',
    }),
};

export const obtenerCuponDestacado = cuponService.obtenerCuponDestacado;

export default cuponService;
