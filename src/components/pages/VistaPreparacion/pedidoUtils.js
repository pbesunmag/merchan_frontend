const lineasDe = (pedido) => pedido?.lineas || pedido?.productos || [];

export const obtenerLineasPedido = lineasDe;

// Un pedido requiere grabado si alguna línea trae texto personalizado
export const tieneGrabadoPersonalizado = (pedido) =>
  lineasDe(pedido).some(
    (linea) =>
      linea.textoPersonalizado &&
      String(linea.textoPersonalizado).trim().length > 0,
  );

export const calcularTotalUnidades = (pedido) =>
  lineasDe(pedido).reduce(
    (acc, linea) => acc + (Number(linea.cantidad) || 1),
    0,
  );

// El estado del botón se deriva exclusivamente del valor persistido en el backend
export const estaPagoAceptado = (pedido) => {
  const estadoNormalizado = String(pedido?.estado || "")
    .trim()
    .toUpperCase()
    .replace(/ /g, "_");
  return estadoNormalizado === "PAGO_ACEPTADO";
};

export const normalizarTexto = (texto) => {
  if (!texto) return "";
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};
