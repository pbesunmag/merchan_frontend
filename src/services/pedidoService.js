import { request } from './api';

export const pedidoService = {
  obtenerPorEstado: (estado) => request(`/pedidos?estado=${estado}&size=50`),

  actualizarEstado: (pedidoId, nuevoEstado) =>
    request(`/pedidos/${pedidoId}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estadoPedido: nuevoEstado }),
    }),
};