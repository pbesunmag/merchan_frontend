import { request } from './api';

export const productService = {
  // Trae los productos (o sólo los activos si usas el filtro)
  obtenerProductos: async () => {
    return await request ('/productos?size=20');
    
  },

  // Crea el pedido nuevo en la terminal
  crearPedido: (terminalId = 1) =>
    request('/pedidos', {
      method: 'POST',
      body: JSON.stringify({ terminalId }),
    }),

  // Añade un ítem al pedido
  agregarProductoAPedido: (pedidoId, datos) =>
  request(`/pedidos/${pedidoId}/productos`, {
    method: 'POST',
    body: JSON.stringify(datos),
  }),
};