import { request } from './api';

export const pedidoService = {
  // GET /api/pedidos?estado={estado}&size=50
  obtenerPorEstado: (estado, size = 50) =>
    request(`/pedidos?estado=${encodeURIComponent(estado)}&size=${size}`),

  // Alias compatible: GET /api/pedidos?estado={estado}&size={size}
  obtenerPedidosPorEstado: (estado, size = 5) =>
    request(`/pedidos?estado=${encodeURIComponent(estado)}&size=${size}&sort=fechaActualizacion,desc`),

  // GET /api/pedidos?estado=ENTREGADO&size=5 (más recientes primero) → ticker de la pantalla de recogida
  obtenerEntregasRecientes: (size = 5) =>
    request(`/pedidos?estado=ENTREGADO&size=${size}&sort=fechaActualizacion,desc`),

  // POST /api/pedidos/checkout → creación atómica del pedido completo
  // lineas: [{ productoId, cantidad, talla, textoPersonalizado }]
  checkout: (terminalId, lineas) =>
    request('/pedidos/checkout', {
      method: 'POST',
      body: JSON.stringify({ terminalId, lineas }),
    }),

  // PATCH /api/pedidos/{pedidoId}/estado
  actualizarEstado: (pedidoId, nuevoEstado) =>
    request(`/pedidos/${pedidoId}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estadoPedido: nuevoEstado }),
    }),
};
