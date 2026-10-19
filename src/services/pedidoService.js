import { request } from './api';

export const pedidoService = {
  obtenerPorEstado: (estado) => request(`/pedidos?estado=${estado}`),

  actualizarEstado: (pedidoId, nuevoEstado) =>
    request(`/pedidos/${pedidoId}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado: nuevoEstado }),
    }),
};