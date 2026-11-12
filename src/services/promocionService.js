import { request } from './api';

// Servicio de promociones estacionales: consulta la campaña vigente y operaciones de promociones
export const promocionService = {
  // GET /api/promociones/activa -> PromocionResponseDTO o null (si 204 No Content)
  obtenerPromocionActiva: async () => {
    try {
      const data = await request('/promociones/activa');
      if (!data || data.activo === false || !data.porcentajeDescuento) {
        return null;
      }
      return data;
    } catch {
      return null;
    }
  },

  // GET /api/promociones -> listado completo de campañas
  listarTodas: () => request('/promociones'),

  // POST /api/promociones -> alta de campaña
  crearPromocion: (datos) =>
    request('/promociones', {
      method: 'POST',
      body: JSON.stringify(datos),
    }),

  // PATCH /api/promociones/{id}/toggle -> activar/desactivar campaña
  toggleActivo: (id) =>
    request(`/promociones/${id}/toggle`, {
      method: 'PATCH',
    }),
};

export const obtenerPromocionActiva = promocionService.obtenerPromocionActiva;

export const aplicarPorcentaje = (precioBase, porcentaje) => {
  const base = Number(precioBase) || 0;
  const pct = Math.min(100, Math.max(0, Number(porcentaje) || 0));
  if (pct <= 0) {
    return Number(base.toFixed(2));
  }
  const rebajado = (base * (100 - pct)) / 100;
  return Math.round((rebajado + Number.EPSILON) * 100) / 100;
};

// Resuelve el descuento de catálogo de un producto (exclusivamente descuento individual fijo: Groot y Thor)
export const resolverDescuentoProducto = (producto) => {
  const pctFijo =
    producto?.tieneDescuentoFijo && Number(producto?.porcentajeDescuento) > 0
      ? Number(producto.porcentajeDescuento)
      : 0;
  const porcentajeEfectivo = pctFijo;
  const precioBase = Number(producto?.precioOriginal ?? producto?.precio) || 0;
  const precioFinal = pctFijo > 0 ? aplicarPorcentaje(precioBase, porcentajeEfectivo) : precioBase;

  return {
    precioBase,
    precioFinal,
    porcentajeEfectivo,
    pctFijo,
    pctPromo: 0,
    esDescuentoFijo: pctFijo > 0,
    tieneRebaja: porcentajeEfectivo > 0,
  };
};

export const calcularPrecioBonificado = (precioOriginal, promocion) => {
  const pct =
    promocion && promocion.activo !== false
      ? Number(promocion?.porcentajeDescuento) || 0
      : 0;
  return aplicarPorcentaje(precioOriginal, pct);
};

export default promocionService;
