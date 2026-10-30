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
  // { lineaPedidoId, cantidad, cantidadNueva, nuevoProductoId, nuevaTalla }
  solicitarCambio: (
    pedidoId,
    { lineaPedidoId, cantidad, cantidadNueva, nuevoProductoId, nuevaTalla }
  ) =>
    request(`/pedidos/${pedidoId}/cambio-producto`, {
      method: 'POST',
      body: JSON.stringify({
        lineaPedidoId,
        cantidad,
        cantidadNueva: cantidadNueva ?? cantidad,
        nuevoProductoId,
        nuevaTalla: nuevaTalla || null,
      }),
    }),
};
