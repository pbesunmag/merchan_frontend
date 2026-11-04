import { request } from './api';

// Servicio de catálogo: solo lectura de productos y stock.
// Las operaciones de pedidos viven en pedidoService.js (sin duplicados).
export const productService = {
  // GET /api/productos?activos=true&size=100 → solo artículos dados de alta
  obtenerProductos: () => request('/productos?activos=true&size=100'),

  // GET /api/productos/{id}/tallas → stock desglosado por talla
  obtenerTallas: (productoId) => request(`/productos/${productoId}/tallas`),
};
