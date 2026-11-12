import { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { WS_URL } from "../../../services/api";
import { productService } from "../../../services/productService";
import { estadisticaService } from "../../../services/estadisticaService";
import useCarrito from "../../../hooks/useCarrito";
import usePromocion from "../../../hooks/usePromocion";
import { obtenerCategoriaProducto } from "../../../utils/categoriaUtils";
import ReactorLoader from "../../ReactorLoader";
import PromoModal from "../../PromoModal/PromoModal";
import DetalleProductoModal from "../../DetalleProductoModal/DetalleProductoModal";
import CatalogoGrid from "./CatalogoGrid";
import ComandaSidebar from "./ComandaSidebar";
import BannerSuperior from "../../BannerSuperior/BannerSuperior";
import "./VistaTerminal.css";
import BannerSlider from "../../BannerSlider/BannerSlider";
import FormularioSoporte from "../../FormularioSoporte/FormularioSoporte";

export default function VistaTerminal() {
  const {
    carrito,
    mostrarCarrito,
    setMostrarCarrito,
    avisoStockId,
    procesandoPedido,
    pedidoFinalizado,
    errorPedido,
    setErrorPedido,
    totalUnidades,
    subtotalFormateado,
    descuentoCuponMonto,
    descuentoCuponFormateado,
    totalFormateado,
    cuponActivo,
    validandoCupon,
    errorCupon,
    setErrorCupon,
    aplicarCupon,
    removerCupon,
    esPersonalizable,
    calcularPrecioUnidad,
    calcularPrecioUnidadConCupon,
    mostrarAlertaTopeStock,
    agregarAlCarrito,
    actualizarCantidad,
    actualizarTextoPersonalizado,
    eliminarDelCarrito,
    vaciarCarrito,
    finalizarPedido,
    limpiarPedidoFinalizado,
  } = useCarrito();

  const { promocion } = usePromocion();

  // Estados para el envío del ticket de compra por correo o teléfono (Simulación Stark Dispatch)
  const [deseaTicketCorreo, setDeseaTicketCorreo] = useState(false);
  const [deseaTicketTelefono, setDeseaTicketTelefono] = useState(false);
  const [emailTicket, setEmailTicket] = useState("");
  const [telefonoTicket, setTelefonoTicket] = useState("");
  const [ticketConfirmado, setTicketConfirmado] = useState(false);
  const [notificacionTicket, setNotificacionTicket] = useState(null);
  const [errorTicket, setErrorTicket] = useState("");

  const mostrarToastTicket = (mensaje) => {
    setNotificacionTicket(mensaje);
    setTimeout(() => {
      setNotificacionTicket(null);
    }, 7000);
  };

  const construirMensajeTicket = () => {
    const destinos = [];
    if (deseaTicketCorreo && emailTicket.trim()) {
      destinos.push(`al correo ${emailTicket.trim()}`);
    }
    if (deseaTicketTelefono && telefonoTicket.trim()) {
      destinos.push(`al número telefónico ${telefonoTicket.trim()}`);
    }
    if (destinos.length === 0) return null;
    return `📩 [Simulación de servicio Stark Dispatch] Se ha enviado el ticket de compra ${destinos.join(" y ")}.`;
  };

  const manejarEnvioTicketManual = (e) => {
    e.preventDefault();
    setErrorTicket("");

    if (deseaTicketCorreo && !emailTicket.trim()) {
      setErrorTicket("Por favor, introduce un correo electrónico válido.");
      return;
    }
    if (
      deseaTicketCorreo &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTicket.trim())
    ) {
      setErrorTicket("El formato del correo electrónico no es válido.");
      return;
    }
    if (deseaTicketTelefono && !telefonoTicket.trim()) {
      setErrorTicket("Por favor, introduce un número telefónico.");
      return;
    }
    if (
      deseaTicketTelefono &&
      !/^[0-9+\s()-]{6,15}$/.test(telefonoTicket.trim())
    ) {
      setErrorTicket(
        "Introduce un número telefónico válido (mín. 6 dígitos).",
      );
      return;
    }

    const msg = construirMensajeTicket();
    if (msg) {
      setTicketConfirmado(true);
      mostrarToastTicket(msg);
    }
  };

  const cancelarTicketConfirmado = () => {
    setTicketConfirmado(false);
    setDeseaTicketCorreo(false);
    setDeseaTicketTelefono(false);
    setEmailTicket("");
    setTelefonoTicket("");
    setErrorTicket("");
  };

  useEffect(() => {
    if (pedidoFinalizado) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pedidoFinalizado]);

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [productoMasVendido, setProductoMasVendido] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("TODOS");

  const [mostrarPromo, setMostrarPromo] = useState(() => {
    return !sessionStorage.getItem("promo_mostrada");
  });

  const cerrarPromo = () => {
    sessionStorage.setItem("promo_mostrada", "true");
    setMostrarPromo(false);
  };

  const LIMITE_INICIAL = 8;
  const [mostrarTodos, setMostrarTodos] = useState(false);

  const filtrarSoloActivos = (lista) =>
    (Array.isArray(lista) ? lista : []).filter((p) => p && p.activo !== false);

  const cargarCatalogo = async () => {
    try {
      setError(null);
      const data = await productService.obtenerProductos();
      const lista = filtrarSoloActivos(data?.content || data || []);
      setProductos(lista);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let montado = true;

    const initCatalogo = async () => {
      try {
        const data = await productService.obtenerProductos();
        if (montado) {
          const lista = filtrarSoloActivos(data?.content || data || []);
          setProductos(lista);
        }
      } catch (err) {
        if (montado) setError(err.message);
      } finally {
        if (montado) setLoading(false);
      }
    };

    initCatalogo();

    const initMasVendido = async () => {
      try {
        const data = await estadisticaService.obtenerProductoMasVendido();
        if (montado) setProductoMasVendido(data || null);
      } catch (err) {
        console.warn("No se pudo obtener el producto más vendido:", err);
      }
    };

    initMasVendido();

    const urlWs = import.meta.env.VITE_WS_URL || WS_URL || "ws://localhost:8080/ws";
    const urlSockJs = urlWs.replace(/^ws(s?):/, "http$1:");

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(urlSockJs),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: () => {}, // Silencioso para evitar inundar la consola si el backend está arrancando
      onStompError: () => {},
      onWebSocketError: () => {},
      onWebSocketClose: () => {},
      onConnect: () => {
        stompClient.subscribe("/topic/productos-stock", (mensaje) => {
          if (!montado || !mensaje.body) return;
          try {
            const productoActualizado = JSON.parse(mensaje.body);
            setProductos((prevProductos) => {
              // Si un producto pasa a inactivo, se retira del catálogo público
              if (productoActualizado.activo === false) {
                return prevProductos.filter(
                  (p) => p.id !== productoActualizado.id,
                );
              }
              const existe = prevProductos.some(
                (p) => p.id === productoActualizado.id,
              );
              if (existe) {
                return prevProductos.map((p) =>
                  p.id === productoActualizado.id
                    ? { ...p, ...productoActualizado }
                    : p,
                );
              }
              return [...prevProductos, productoActualizado];
            });

            setProductoSeleccionado((prevSel) =>
              prevSel && prevSel.id === productoActualizado.id
                ? productoActualizado.activo === false
                  ? null
                  : { ...prevSel, ...productoActualizado }
                : prevSel,
            );
          } catch {
            // Silencioso al parsear mensaje
          }
        });
      },
    });

    stompClient.activate();

    return () => {
      montado = false;
      stompClient.deactivate();
    };
  }, []);

  const errorVisible = error || errorPedido;
  const cerrarError = () => {
    setError(null);
    setErrorPedido(null);
  };

  const finalizarPedidoYRecargar = () => {
    const msgTicket = construirMensajeTicket();
    if (msgTicket) {
      mostrarToastTicket(msgTicket);
    }
    finalizarPedido(cargarCatalogo);
  };

  const reiniciarNuevoPedido = () => {
    cancelarTicketConfirmado();
    limpiarPedidoFinalizado();
  };

  if (loading || procesandoPedido) {
    return (
      <ReactorLoader
        size={150}
        text={
          procesandoPedido
            ? "Registrando solicitud de suministros en Stark Industries..."
            : "Iniciando enlace con Stark Industries..."
        }
      />
    );
  }

  if (pedidoFinalizado) {
    const msgConfirmacionTicket = construirMensajeTicket();
    return (
      <div className="terminal-exito-wrapper">
        <div className="modal-exito">
          <h2>⭐ Transmisión Completada ⭐</h2>
          <p className="terminal-exito-subtexto">
            Tu solicitud de equipamiento ha sido enviada al área de preparación:
          </p>
          <div className="codigo-destacado">{pedidoFinalizado}</div>
          {msgConfirmacionTicket && (
            <div className="aviso-ticket-exito">{msgConfirmacionTicket}</div>
          )}
          <button
            className="btn-agregar btn-nuevo-pedido-exito"
            onClick={reiniciarNuevoPedido}
          >
            Realizar nuevo pedido
          </button>
        </div>

        {notificacionTicket && (
          <div className="terminal-toast-ticket">
            <span>{notificacionTicket}</span>
            <button
              type="button"
              className="btn-cerrar-toast-ticket"
              onClick={() => setNotificacionTicket(null)}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    );
  }

  const normalizarTexto = (texto) => {
    if (!texto) return "";
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const productosActivos = productos.filter((p) => p && p.activo !== false);

  const categoriasBase = [
    ...new Set(
      productosActivos.map((p) => {
        const cat = obtenerCategoriaProducto(p);
        return cat.trim().toUpperCase();
      }),
    ),
  ].filter((c) => c && c !== "TODOS" && c !== "PERSONALIZABLES");

  const categoriasUnicas = ["TODOS", ...categoriasBase, "PERSONALIZABLES"];

  const productosFiltrados = productosActivos.filter((prod) => {
    const categoriaProd = normalizarTexto(obtenerCategoriaProducto(prod));
    const categoriaSeleccionadaNorm = normalizarTexto(categoriaSeleccionada);

    const coincideCategoria =
      categoriaSeleccionada === "TODOS"
        ? true
        : categoriaSeleccionada === "PERSONALIZABLES"
          ? esPersonalizable(prod)
          : categoriaProd === categoriaSeleccionadaNorm;

    const textoBusquedaNormalizado = normalizarTexto(busqueda);
    const nombreNormalizado = normalizarTexto(prod.nombre);
    const descripcionNormalizada = normalizarTexto(prod.descripcion);

    const coincideTexto =
      nombreNormalizado.includes(textoBusquedaNormalizado) ||
      descripcionNormalizada.includes(textoBusquedaNormalizado) ||
      categoriaProd.includes(textoBusquedaNormalizado);

    return coincideCategoria && coincideTexto;
  });

  const productosVisibles = mostrarTodos
    ? productosFiltrados
    : productosFiltrados.slice(0, LIMITE_INICIAL);

  const handleFiltroDesdeBanner = (cat) => {
    if (!cat) return;
    if (Array.isArray(cat)) {
      setCategoriaSeleccionada(cat[0].toUpperCase());
    } else {
      setCategoriaSeleccionada(cat.toUpperCase());
    }
  };

  return (
    <div className="terminal-layout">
      <BannerSuperior />
      {mostrarPromo && <PromoModal alCerrar={cerrarPromo} />}

      <BannerSlider
        promocion={promocion}
        alFiltrarCategoria={handleFiltroDesdeBanner}
        onSeleccionarCategoria={handleFiltroDesdeBanner}
      />

      <button
        className="btn-carrito-flotante"
        onClick={() => setMostrarCarrito(!mostrarCarrito)}
      >
        🛒
        {totalUnidades > 0 && (
          <span className="badge-carrito">{totalUnidades}</span>
        )}
      </button>

      <section className="catalogo-section catalogo-container">
        <div className="catalogo-header-bar">
          <h2>Catálogo de Equipamiento</h2>
          <span className="contador-suministros">
            Mostrando {productosVisibles.length} de {productosFiltrados.length}{" "}
            suministros
          </span>
        </div>

        <div className="buscador-filtros-container">
          <input
            type="text"
            placeholder="Buscar por nombre, personaje, descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="comanda-custom-input buscador-input"
          />

          <div className="categorias-botones-grid">
            {categoriasUnicas.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSeleccionada(cat)}
                className={`btn-categoria ${normalizarTexto(categoriaSeleccionada) === normalizarTexto(cat) ? "activo" : ""} ${cat === "PERSONALIZABLES" ? "btn-filtro-personalizables" : ""}`}
              >
                {cat === "PERSONALIZABLES" ? "⚡ PERSONALIZABLES" : cat}
              </button>
            ))}
          </div>
        </div>

        {errorVisible && (
          <div className="terminal-error-banner">
            <span>⚠️ {errorVisible}</span>
            <button type="button" onClick={cerrarError}>
              ✕
            </button>
          </div>
        )}

        <CatalogoGrid
          productosVisibles={productosVisibles}
          productosFiltrados={productosFiltrados}
          carrito={carrito}
          productoMasVendido={productoMasVendido}
          mostrarTodos={mostrarTodos}
          limiteInicial={LIMITE_INICIAL}
          alSeleccionar={setProductoSeleccionado}
          alAgregar={agregarAlCarrito}
          alAlternarMostrarTodos={() => setMostrarTodos(!mostrarTodos)}
        />

      </section>

      <FormularioSoporte />

      {mostrarCarrito && (
        <ComandaSidebar
          carrito={carrito}
          avisoStockId={avisoStockId}
          errorVisible={errorVisible}
          subtotalFormateado={subtotalFormateado}
          descuentoCuponMonto={descuentoCuponMonto}
          descuentoCuponFormateado={descuentoCuponFormateado}
          totalFormateado={totalFormateado}
          cuponActivo={cuponActivo}
          validandoCupon={validandoCupon}
          errorCupon={errorCupon}
          setErrorCupon={setErrorCupon}
          aplicarCupon={aplicarCupon}
          removerCupon={removerCupon}
          esPersonalizable={esPersonalizable}
          calcularPrecioUnidad={calcularPrecioUnidad}
          calcularPrecioUnidadConCupon={calcularPrecioUnidadConCupon}
          mostrarAlertaTopeStock={mostrarAlertaTopeStock}
          actualizarCantidad={actualizarCantidad}
          actualizarTextoPersonalizado={actualizarTextoPersonalizado}
          eliminarDelCarrito={eliminarDelCarrito}
          vaciarCarrito={vaciarCarrito}
          cerrarError={cerrarError}
          alCerrar={() => setMostrarCarrito(false)}
          alFinalizar={finalizarPedidoYRecargar}
          ticket={{
            deseaTicketCorreo,
            setDeseaTicketCorreo,
            deseaTicketTelefono,
            setDeseaTicketTelefono,
            emailTicket,
            setEmailTicket,
            telefonoTicket,
            setTelefonoTicket,
            ticketConfirmado,
            errorTicket,
            setErrorTicket,
            manejarEnvioTicketManual,
            cancelarTicketConfirmado,
          }}
        />
      )}

      {notificacionTicket && (
        <div className="terminal-toast-ticket">
          <span>{notificacionTicket}</span>
          <button
            type="button"
            className="btn-cerrar-toast-ticket"
            onClick={() => setNotificacionTicket(null)}
          >
            ✕
          </button>
        </div>
      )}

      <DetalleProductoModal
        producto={productoSeleccionado}
        carrito={carrito}
        alCerrar={() => setProductoSeleccionado(null)}
        alAgregar={agregarAlCarrito}
      />
    </div>
  );
}