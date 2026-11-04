// Utilidades de categoría basadas EXCLUSIVAMENTE en las propiedades formales del DTO
// (producto.nombreCategoria o producto.categoria). Sin IDs fijos ni regex sobre el nombre.

const normalizar = (texto) =>
  String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

// Devuelve el nombre de categoría tal como lo envía el backend
export const obtenerCategoriaProducto = (prod) => {
  if (!prod) return 'Otros';
  const categoria =
    prod.nombreCategoria ||
    (typeof prod.categoria === 'object' ? prod.categoria?.nombre : prod.categoria);
  return categoria && String(categoria).trim() ? String(categoria).trim() : 'Otros';
};

// Compara la categoría del producto con una clave (insensible a mayúsculas, tildes y plural)
export const perteneceACategoria = (prod, clave) => {
  const categoria = normalizar(obtenerCategoriaProducto(prod));
  const buscada = normalizar(clave).replace(/s$/, '');
  return categoria.replace(/s$/, '') === buscada;
};

// Artículo textil que requiere selección de talla
export const esCamiseta = (prod) =>
  perteneceACategoria(prod, 'camisetas') ||
  (Array.isArray(prod?.tallas) && prod.tallas.length > 0);
