import { request } from './api';

export const cajaService = {
  // GET /api/caja/metricas?periodo=HOY|MES|ANIO
  obtenerMetricas: (periodo) =>
    request(`/caja/metricas?periodo=${encodeURIComponent(periodo)}`),

  // POST /api/pedidos/{pedidoId}/devolucion
  solicitarDevolucion: (pedidoId) =>
    request(`/pedidos/${pedidoId}/devolucion`, { method: 'POST' }),

  // POST /api/pedidos/{pedidoId}/cambio-producto
  solicitarCambio: (pedidoId, datosCambio) =>
    request(`/pedidos/${pedidoId}/cambio-producto`, {
      method: 'POST',
      body: JSON.stringify(datosCambio),
    }),
};
