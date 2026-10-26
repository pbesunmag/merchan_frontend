import { useState, useMemo } from "react";
import { productService } from "../services/productService";
import { obtenerCategoriaProducto } from "../utils/categoriaUtils";

const PRECIO_GRABADO_REBAJADO = 3.0;

// Comprueba si un artículo admite grabado personalizado.
export const esPersonalizable = (item) => {
  if (!item) return false;
  if (
    item.personalizable === true ||
    item.personalizable === 1 ||
    item.personalizable === "Sí" ||
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

  const categoria = obtenerCategoriaProducto(item);
  if (categoria.toLowerCase().includes("figura")) {
    return false;
  }
  return true;
};

// Precio de una unidad: descuentos de figuras + grabado personalizado.
export const calcularPrecioUnidad = (item) => {
  const precioBase = Number(item.precio) || 0;
  const nombre = (item.nombre || "").trim();

  let precioConDescuentoFigura = precioBase;
  if (nombre.includes("Figura Groot Guardianes")) {
    if (precioBase > 30) {
      precioConDescuentoFigura = precioBase * 0.75;
    }
  } else if (nombre.includes("Figura Thor Dios del Trueno")) {
    if (precioBase > 40) {
      precioConDescuentoFigura = precioBase * 0.9;
    }
  }

  const tieneGrabado =
    esPersonalizable(item) && item.textoPersonalizado?.trim().length > 0;
  return precioConDescuentoFigura + (tieneGrabado ? PRECIO_GRABADO_REBAJADO : 0);
};

export default function useCarrito() {
  const [carrito, setCarrito] = useState([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [avisoStockId, setAvisoStockId] = useState(null);

  const [codigoCupon, setCodigoCupon] = useState("");
  const [cuponAplicado, setCuponAplicado] = useState(null);
  const [errorCupon, setErrorCupon] = useState("");

  const [procesandoPedido, setProcesandoPedido] = useState(false);
  const [pedidoFinalizado, setPedidoFinalizado] = useState(null);
  const [errorPedido, setErrorPedido] = useState(null);

  // ---- Totales ----
  const totalUnidades = useMemo(
    () => carrito.reduce((acc, item) => acc + (Number(item.cantidad) || 1), 0),
    [carrito],
  );

  const subtotalSinCupon = useMemo(
    () =>
      carrito.reduce(
        (acc, item) =>
          acc + calcularPrecioUnidad(item) * (Number(item.cantidad) || 1),
        0,
      ),
    [carrito],
  );

  const montoDescuento = cuponAplicado
    ? subtotalSinCupon * (cuponAplicado.porcentaje / 100)
    : 0;
  const totalConDescuento = (subtotalSinCupon - montoDescuento).toFixed(2);

  // ---- Operaciones del carrito ----
  const mostrarAlertaTopeStock = (idUnico) => {
    setAvisoStockId(idUnico);
  };

  const agregarAlCarrito = (producto) => {
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
            ? { ...item, cantidad: cantActual + 1, stockMax: maxPermitido }
            : item,
        );
      }
      return [
        ...prev,
        {
          ...producto,
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
    setCuponAplicado(null);
    setCodigoCupon("");
    setAvisoStockId(null);
  };

  // ---- Cupones ----
  const aplicarCupon = (e) => {
    e.preventDefault();
    const codigoLimpio = codigoCupon.trim().toUpperCase();

    const cuponesUsadosSesion = JSON.parse(
      sessionStorage.getItem("cupones_usados_sesion") || "[]",
    );
    if (cuponesUsadosSesion.includes(codigoLimpio)) {
      setErrorCupon(
        "✨ Este código ya fue utilizado anteriormente en esta sesión.",
      );
      return;
    }

    if (codigoLimpio === "STARK10") {
      setCuponAplicado({ codigo: "STARK10", porcentaje: 10 });
      setErrorCupon("");
    } else if (codigoLimpio === "GROOT5") {
      setCuponAplicado({ codigo: "GROOT5", porcentaje: 5 });
      setErrorCupon("");
    } else {
      setErrorCupon("⚠️ Código no válido o caducado");
    }
  };

  const quitarCupon = () => {
    setCuponAplicado(null);
  };

  // ---- Pedido ----
  // onSuccessCallback: se ejecuta al confirmar el pedido (p. ej. recargar el catálogo).
  const finalizarPedido = async (onSuccessCallback) => {
    if (carrito.length === 0 || procesandoPedido) return;

    try {
      setErrorPedido(null);
      setProcesandoPedido(true);

      const itemsAProcesar = [...carrito];
      const cuponActual = cuponAplicado;

      // POST /api/pedidos
      const nuevoPedido = await productService.crearPedido(1);

      // POST /api/pedidos/{pedidoId}/productos
      for (const item of itemsAProcesar) {
        await productService.agregarProductoAPedido(nuevoPedido.id, {
          productoId: item.id,
          cantidad: Number(item.cantidad) || 1,
          textoPersonalizado: esPersonalizable(item)
            ? item.textoPersonalizado
            : null,
          talla: item.talla || null,
        });
      }

      if (cuponActual) {
        const cuponesUsadosSesion = JSON.parse(
          sessionStorage.getItem("cupones_usados_sesion") || "[]",
        );
        if (!cuponesUsadosSesion.includes(cuponActual.codigo)) {
          cuponesUsadosSesion.push(cuponActual.codigo);
          sessionStorage.setItem(
            "cupones_usados_sesion",
            JSON.stringify(cuponesUsadosSesion),
          );
        }
      }

      // Solo vaciamos el carrito una vez confirmado con éxito en el backend
      setMostrarCarrito(false);
      setCarrito([]);
      setCuponAplicado(null);
      setCodigoCupon("");
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
    codigoCupon,
    setCodigoCupon,
    cuponAplicado,
    setCuponAplicado,
    errorCupon,
    setErrorCupon,
    procesandoPedido,
    pedidoFinalizado,
    errorPedido,
    setErrorPedido,
    totalUnidades,
    subtotalSinCupon,
    totalConDescuento,
    esPersonalizable,
    calcularPrecioUnidad,
    mostrarAlertaTopeStock,
    agregarAlCarrito,
    actualizarCantidad,
    actualizarTextoPersonalizado,
    eliminarDelCarrito,
    vaciarCarrito,
    aplicarCupon,
    quitarCupon,
    finalizarPedido,
    limpiarPedidoFinalizado,
  };
}
