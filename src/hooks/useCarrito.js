import { useState, useEffect, useMemo } from "react";
import { pedidoService } from "../services/pedidoService";
import { perteneceACategoria } from "../utils/categoriaUtils";

const CLAVE_STORAGE_CARRITO = "stark_carrito_activo";

// Comprueba si un artículo admite grabado personalizado según el DTO del backend.
export const esPersonalizable = (item) => {
  if (!item) return false;
  if (
    item.personalizable === true ||
    item.personalizable === 1 ||
    item.personalizable === "Sí" ||
    item.personalizable === "Si" ||
    item.personalizable === "true"
  ) {
    return true;
  }
  if (
    item.personalizable === "No" ||
    item.personalizable === false ||
    item.personalizable === 0
  ) {
    return false;
  }

  if (perteneceACategoria(item, "figuras")) {
    return false;
  }
  return true;
};

// Precio unitario estricto: coincide exactamente con producto.precio del catálogo oficial.
export const calcularPrecioUnidad = (item) => {
  return Number(item?.precio) || 0;
};

export default function useCarrito() {
  // Inicialización perezosa desde localStorage para conservar la cesta al recargar
  const [carrito, setCarrito] = useState(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_STORAGE_CARRITO);
      const parseado = guardado ? JSON.parse(guardado) : [];
      return Array.isArray(parseado)
        ? parseado.filter((item) => item && item.activo !== false)
        : [];
    } catch (err) {
      console.warn("Error al leer el carrito de localStorage:", err);
      return [];
    }
  });

  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [avisoStockId, setAvisoStockId] = useState(null);

  const [procesandoPedido, setProcesandoPedido] = useState(false);
  const [pedidoFinalizado, setPedidoFinalizado] = useState(null);
  const [errorPedido, setErrorPedido] = useState(null);

  // Sincronización automática del carrito en localStorage
  useEffect(() => {
    try {
      if (carrito.length > 0) {
        localStorage.setItem(CLAVE_STORAGE_CARRITO, JSON.stringify(carrito));
      } else {
        localStorage.removeItem(CLAVE_STORAGE_CARRITO);
      }
    } catch (err) {
      console.warn("Error al guardar el carrito en localStorage:", err);
    }
  }, [carrito]);

  // ---- Totales exactos (suma de precioUnitario * cantidad) ----
  const totalUnidades = useMemo(
    () => carrito.reduce((acc, item) => acc + (Number(item.cantidad) || 1), 0),
    [carrito],
  );

  const totalPedido = useMemo(
    () =>
      carrito.reduce(
        (acc, item) =>
          acc + calcularPrecioUnidad(item) * (Number(item.cantidad) || 1),
        0,
      ),
    [carrito],
  );

  const totalFormateado = totalPedido.toFixed(2);

  // ---- Operaciones del carrito ----
  const mostrarAlertaTopeStock = (idUnico) => {
    setAvisoStockId(idUnico);
  };

  const agregarAlCarrito = (producto) => {
    if (!producto || producto.activo === false) return;

    const topeStock = Number(producto.stockMax ?? producto.stock ?? 99);
    if (topeStock <= 0) return;

    const tallaArticulo = producto.talla || "";
    const claveArticulo = `${producto.id}_${producto.nombre || ""}_${tallaArticulo}`;

    setCarrito((prev) => {
      const unidadesYaEnCesta = prev
        .filter((item) =>
          tallaArticulo
            ? item.id === producto.id && item.talla === tallaArticulo
            : item.id === producto.id,
        )
        .reduce((acc, item) => acc + (Number(item.cantidad) || 0), 0);

      if (unidadesYaEnCesta >= topeStock) {
        const itemExistente = prev.find(
          (item) => item.idUnico === claveArticulo,
        );
        if (itemExistente) mostrarAlertaTopeStock(claveArticulo);
        return prev;
      }

      const existe = prev.find((item) => item.idUnico === claveArticulo);
      if (existe) {
        const cantActual = Number(existe.cantidad) || 1;
        const maxPermitido = Number(existe.stockMax ?? topeStock);
        if (cantActual >= maxPermitido) {
          mostrarAlertaTopeStock(claveArticulo);
          return prev;
        }
        return prev.map((item) =>
          item.idUnico === claveArticulo
            ? {
                ...item,
                precio: Number(producto.precio) || item.precio,
                cantidad: cantActual + 1,
                stockMax: maxPermitido,
              }
            : item,
        );
      }
      return [
        ...prev,
        {
          ...producto,
          precio: Number(producto.precio) || 0,
          idUnico: claveArticulo,
          talla: producto.talla || null,
          cantidad: 1,
          stockMax: topeStock,
          textoPersonalizado: "",
        },
      ];
    });
  };

  const actualizarCantidad = (idUnico, nuevaCantidad) => {
    setCarrito((prev) =>
      prev.map((item) => {
        if (item.idUnico !== idUnico) return item;

        const maxStock = Number(item.stockMax ?? item.stock ?? 99);
        const valorParseado = parseInt(nuevaCantidad, 10);
        const cantidadBase = Number.isNaN(valorParseado)
          ? 1
          : Math.max(1, valorParseado);

        if (cantidadBase > maxStock) {
          mostrarAlertaTopeStock(idUnico);
          return { ...item, cantidad: maxStock };
        }

        if (avisoStockId === idUnico) {
          setAvisoStockId(null);
        }

        return { ...item, cantidad: cantidadBase };
      }),
    );
  };

  const actualizarTextoPersonalizado = (idUnico, texto) => {
    setCarrito((prev) =>
      prev.map((item) =>
        item.idUnico === idUnico
          ? { ...item, textoPersonalizado: texto }
          : item,
      ),
    );
  };

  const eliminarDelCarrito = (idUnico) => {
    setCarrito((prev) => prev.filter((item) => item.idUnico !== idUnico));
    if (avisoStockId === idUnico) setAvisoStockId(null);
  };

  const vaciarCarrito = () => {
    setCarrito([]);
    localStorage.removeItem(CLAVE_STORAGE_CARRITO);
    setAvisoStockId(null);
  };

  // ---- Checkout atómico en una sola llamada HTTP ----
  const finalizarPedido = async (onSuccessCallback) => {
    if (carrito.length === 0 || procesandoPedido) return;

    try {
      setErrorPedido(null);
      setProcesandoPedido(true);

      const lineas = carrito.map((item) => ({
        productoId: item.id,
        cantidad: Number(item.cantidad) || 1,
        talla: item.talla || null,
        textoPersonalizado:
          esPersonalizable(item) && item.textoPersonalizado?.trim()
            ? item.textoPersonalizado.trim()
            : null,
      }));

      // Única llamada transaccional: POST /api/pedidos/checkout
      const nuevoPedido = await pedidoService.checkout(1, lineas);

      setMostrarCarrito(false);
      setCarrito([]);
      localStorage.removeItem(CLAVE_STORAGE_CARRITO);
      setPedidoFinalizado(nuevoPedido?.codigo || `AV-${nuevoPedido?.id || 1}`);
      if (typeof onSuccessCallback === "function") {
        await onSuccessCallback();
      }
    } catch (err) {
      setErrorPedido(err.message);
    } finally {
      setProcesandoPedido(false);
    }
  };

  const limpiarPedidoFinalizado = () => {
    setPedidoFinalizado(null);
  };

  return {
    carrito,
    mostrarCarrito,
    setMostrarCarrito,
    avisoStockId,
    procesandoPedido,
    pedidoFinalizado,
    errorPedido,
    setErrorPedido,
    totalUnidades,
    totalPedido,
    totalFormateado,
    esPersonalizable,
    calcularPrecioUnidad,
    mostrarAlertaTopeStock,
    agregarAlCarrito,
    actualizarCantidad,
    actualizarTextoPersonalizado,
    eliminarDelCarrito,
    vaciarCarrito,
    finalizarPedido,
    limpiarPedidoFinalizado,
  };
}
