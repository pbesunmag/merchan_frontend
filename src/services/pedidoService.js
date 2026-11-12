import { request } from './api';

export const pedidoService = {
  // GET /api/pedidos?estado={estado}&size=50
  obtenerPorEstado: (estado, size = 50) =>
    request(`/pedidos?estado=${encodeURIComponent(estado)}&size=${size}`),

  // Alias compatible: GET /api/pedidos?estado={estado}&size={size}
  obtenerPedidosPorEstado: (estado, size = 5) =>
    request(`/pedidos?estado=${encodeURIComponent(estado)}&size=${size}&sort=fechaActualizacion,desc`),

  // POST /api/pedidos/checkout → creación atómica del pedido completo
  // lineas: [{ productoId, cantidad, talla, textoPersonalizado, variante }]
  checkout: (terminalId, lineas, codigoCupon = null) =>
    request('/pedidos/checkout', {
      method: 'POST',
      body: JSON.stringify({
        terminalId,
        lineas,
        ...(codigoCupon ? { codigoCupon } : {}),
      }),
    }),

  // PATCH /api/pedidos/{pedidoId}/estado
  actualizarEstado: (pedidoId, nuevoEstado) =>
    request(`/pedidos/${pedidoId}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estadoPedido: nuevoEstado }),
    }),
};
