import { request } from './api';

export const pedidoService = {
  obtenerPorEstado: (estado) => request(`/pedidos?estado=${estado}&size=50`),

  crearPedido: (terminalId = 1) =>
    request('/pedidos', {
      method: 'POST',
      body: JSON.stringify({ terminalId }),
    }),

  agregarProductoAPedido: (pedidoId, datos) =>
    request(`/pedidos/${pedidoId}/productos`, {
      method: 'POST',
      body: JSON.stringify(datos),
    }),

  actualizarEstado: (pedidoId, nuevoEstado) =>
    request(`/pedidos/${pedidoId}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estadoPedido: nuevoEstado }),
    }),
};