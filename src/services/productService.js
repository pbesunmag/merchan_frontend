import { request } from './api';

// Servicio de catálogo: lectura de productos, stock y actualización de descuentos.
export const productService = {
  // GET /api/productos?activos=true&size=100 → solo artículos dados de alta
  obtenerProductos: () => request('/productos?activos=true&size=100'),

  // GET /api/productos/{id}/tallas → stock desglosado por talla
  obtenerTallas: (productoId) => request(`/productos/${productoId}/tallas`),

  // PATCH /api/productos/{id}/descuento → actualiza porcentajeDescuento y tieneDescuentoFijo
  actualizarDescuento: (productoId, porcentajeDescuento, tieneDescuentoFijo) =>
    request(`/productos/${productoId}/descuento`, {
      method: 'PATCH',
      body: JSON.stringify({
        porcentajeDescuento: Number(porcentajeDescuento) || 0,
        tieneDescuentoFijo: Boolean(tieneDescuentoFijo),
      }),
    }),
};
