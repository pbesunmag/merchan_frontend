/**
 * Utilidades de formateo para la plataforma Avengers Shop.
 */

/**
 * Formatea un valor numérico como cadena de precio con 2 decimales y símbolo de euro.
 * Usa un espacio de no separación (\u00A0) para que el importe y el símbolo
 * nunca queden en líneas distintas (igual que el antiguo `&nbsp;€` de las vistas).
 * @param {number|string} cantidad - Valor numérico a formatear
 * @returns {string} Ejemplo: "25.88 €"
 */
export const formatearMoneda = (cantidad) => {
  const num = Number(cantidad) || 0;
  return `${num.toFixed(2)}\u00A0€`;
};

/**
 * Devuelve el código oficial de un pedido o genera el código de respaldo con prefijo AV-.
 * @param {Object} pedido - Objeto de pedido con propiedades codigo o id
 * @returns {string} Ejemplo: "AV-1014"
 */
export const obtenerCodigoPedido = (pedido) => {
  if (!pedido) return 'AV-????';
  return pedido.codigo || `AV-${pedido.id}`;
};

/**
 * Formatea el identificador de un personaje reemplazando guiones bajos y aplicando Title Case.
 * @param {string} texto - Identificador crudo (ej: "CAPITAN_AMERICA" o "groot")
 * @returns {string} Ejemplo: "Capitan America" o "Vengadores" por defecto
 */
export const formatearPersonaje = (texto) => {
  if (!texto) return 'Vengadores';
  return texto
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
