// Obtiene la categoría "normalizada" de un producto a partir de su nombre
// o de los campos de categoría que devuelva el backend.
export const obtenerCategoriaProducto = (prod) => {
  const nombre = (prod.nombre || "").toLowerCase();
  const catOriginal =
    prod.nombreCategoria || prod.categoriaNombre || prod.categoria || "";

  if (nombre.includes("taza")) return "Tazas";
  if (nombre.includes("gorra")) return "Gorras";
  if (nombre.includes("figura")) return "Figuras";
  if (nombre.includes("camiseta") || nombre.includes("remera"))
    return "Camisetas";

  return catOriginal || "Otros";
};
