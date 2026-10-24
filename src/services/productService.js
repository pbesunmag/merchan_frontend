import { request } from './api';

export const productService = {
  // GET /api/productos
  obtenerProductos: () => request('/productos?size=20'),

  // POST /api/pedidos
  crearPedido: (terminalId = 1) =>
    request('/pedidos', {
      method: 'POST',
      body: JSON.stringify({ terminalId }),
    }),

  // POST /api/pedidos/{pedidoId}/productos
  agregarProductoAPedido: (pedidoId, datos) =>
    request(`/pedidos/${pedidoId}/productos`, {
      method: 'POST',
      body: JSON.stringify(datos),
    }),
};