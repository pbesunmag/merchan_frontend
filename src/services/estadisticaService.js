import { request } from './api';

export const estadisticaService = {
  // GET /api/estadisticas/producto-mas-vendido
  obtenerProductoMasVendido: () => request('/estadisticas/producto-mas-vendido'),
};
