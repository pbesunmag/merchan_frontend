import { request } from './api';

export const cajaService = {
  // GET /api/caja/metricas?periodo=HOY|MES|ANIO
  obtenerMetricas: (periodo) =>
    request(`/caja/metricas?periodo=${encodeURIComponent(periodo)}`),

  // POST /api/pedidos/{pedidoId}/devolucion
  solicitarDevolucion: (pedidoId) =>
    request(`/pedidos/${pedidoId}/devolucion`, { method: 'POST' }),

  // POST /api/pedidos/{pedidoId}/devolucion-linea  { lineaPedidoId, cantidad }
  solicitarDevolucionLinea: (pedidoId, { lineaPedidoId, cantidad }) =>
    request(`/pedidos/${pedidoId}/devolucion-linea`, {
      method: 'POST',
      body: JSON.stringify({ lineaPedidoId, cantidad }),
    }),

  // POST /api/pedidos/{pedidoId}/cambio-producto
  // { lineaPedidoId, cantidadEntregada, nuevosArticulos } (también admite formato 1 a 1)
  solicitarCambio: (
    pedidoId,
    {
      lineaPedidoId,
      cantidad,
      cantidadEntregada,
      cantidadNueva,
      nuevoProductoId,
      nuevaTalla,
      nuevosArticulos,
    }
  ) =>
    request(`/pedidos/${pedidoId}/cambio-producto`, {
      method: 'POST',
      body: JSON.stringify({
        lineaPedidoId,
        cantidad: cantidad ?? cantidadEntregada,
        cantidadEntregada: cantidadEntregada ?? cantidad,
        cantidadNueva: cantidadNueva ?? cantidadEntregada ?? cantidad,
        nuevoProductoId: nuevoProductoId || null,
        nuevaTalla: nuevaTalla || null,
        nuevosArticulos: Array.isArray(nuevosArticulos) ? nuevosArticulos : null,
      }),
    }),
};
