export const obtenerLineas = (pedido) => pedido?.lineas || pedido?.productos || [];

// Los importes se comparan y multiplican en céntimos para evitar errores de coma flotante
export const aCentimos = (importe) => Math.round((Number(importe) || 0) * 100);
export const deCentimos = (centimos) => centimos / 100;

export const rutaImagen = (producto) => {
  const cruda = producto?.imagenUrl || producto?.imagen_url;
  if (!cruda || cruda.trim() === '') return null;
  return cruda.startsWith('/') || cruda.startsWith('http') ? cruda : `/${cruda}`;
};
