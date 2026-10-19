import { request } from './api';

export const productService = {
  // Trae los productos (o sólo los activos si usas el filtro)
  obtenerProductos: () => request('/productos'),
  
  // Crea el pedido nuevo en la terminal
  crearPedido: (terminalId = 1) =>
    request('/pedidos', {
      method: 'POST',
      body: JSON.stringify({ terminalId }),
    }),

  // Añade un ítem al pedido
  agregarProductoAPedido: (pedidoId, { productoId, cantidad, textoPersonalizado }) =>
    request(`/pedidos/${pedidoId}/productos`, {
      method: 'POST',
      body: JSON.stringify({
        productoId,
        cantidad,
        textoPersonalizado: textoPersonalizado || null,
      }),
    }),
};