import { useState, useCallback, useRef } from "react";
import { pedidoService } from "../../../services/pedidoService";
import { obtenerCodigoPedido } from "../../../utils/formatoUtils";
import { usePollingPedidos } from "../../../hooks/usePollingPedidos";
import ReactorLoader from "../../ReactorLoader";
import ModalPostventa from "../../ModalPostventa/ModalPostventa";
import PanelMetricas from "../../PanelMetricas/PanelMetricas";
import PanelDescuentos from "../../PanelDescuentos/PanelDescuentos";
import ColumnaKanban from "./ColumnaKanban";
import {
  obtenerLineasPedido,
  tieneGrabadoPersonalizado,
  normalizarTexto,
} from "./pedidoUtils";
import "./VistaPreparacion.css";
import { descargarInformeCompleto } from "../../../services/informeService";

export default function VistaPreparacion() {
  const [pedidosCreados, setPedidosCreados] = useState([]);
  const [pedidosEnProceso, setPedidosEnProceso] = useState([]);
  const [pedidosListos, setPedidosListos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [soloConGrabado, setSoloConGrabado] = useState(false);
  const [pedidoACancelar, setPedidoACancelar] = useState(null);
  const [postventaAbierta, setPostventaAbierta] = useState(false);
  const [metricasAbiertas, setMetricasAbiertas] = useState(false);
  const [descuentosAbiertos, setDescuentosAbiertos] = useState(false);

  const [pedidoAPagoModal, setPedidoAPagoModal] = useState(null);
  const [toastMensaje, setToastMensaje] = useState(null);
  const [lineasCompletadas, setLineasCompletadas] = useState({});
  const toastTimeoutRef = useRef(null);

  const mostrarToast = (texto) => {
    setToastMensaje(texto);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToastMensaje(null);
    }, 8000);
  };

  const alternarLineaCompletada = (pedidoId, indiceLinea) => {
    const clave = `${pedidoId}-${indiceLinea}`;
    setLineasCompletadas((prev) => ({
      ...prev,
      [clave]: !prev[clave],
    }));
  };

  const consultarPedidos = useCallback(async () => {
    const [creadosRes, pagadosRes, enProcesoRes, listosRes] = await Promise.all(
      [
        pedidoService.obtenerPorEstado("CREADO"),
        pedidoService.obtenerPorEstado("PAGO_ACEPTADO"),
        pedidoService.obtenerPorEstado("EN_PREPARACION"),
        pedidoService.obtenerPorEstado("PEDIDO_LISTO"),
      ],
    );

    const creados = creadosRes?.content || creadosRes || [];
    const pagados = pagadosRes?.content || pagadosRes || [];
    setPedidosCreados([...creados, ...pagados].sort((a, b) => a.id - b.id));
    setPedidosEnProceso(enProcesoRes?.content || enProcesoRes || []);
    setPedidosListos(listosRes?.content || listosRes || []);
  }, []);

  const { loading, error, isOffline, setError, recargar } =
    usePollingPedidos(consultarPedidos);

  const cambiarEstado = async (pedidoId, nuevoEstado, mensajeToast = null) => {
    try {
      await pedidoService.actualizarEstado(pedidoId, nuevoEstado);
      if (mensajeToast) mostrarToast(mensajeToast);
      recargar(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const entregarPedido = async (pedido) => {
    try {
      await pedidoService.actualizarEstado(pedido.id, "ENTREGADO");
      const codigoEntregado = obtenerCodigoPedido(pedido);
      mostrarToast(`✅ Pedido ${codigoEntregado} registrado como entregado`);
      recargar(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const ejecutarCancelacion = async () => {
    if (!pedidoACancelar) return;
    const codigo = obtenerCodigoPedido(pedidoACancelar);
    await cambiarEstado(
      pedidoACancelar.id,
      "CANCELADO",
      `⚠️ Pedido ${codigo} cancelado`,
    );
    setPedidoACancelar(null);
  };

  const confirmarPago = async () => {
    if (!pedidoAPagoModal) return;
    const pedido = pedidoAPagoModal;
    const codigo = obtenerCodigoPedido(pedido);
    setPedidoAPagoModal(null);
    try {
      await pedidoService.actualizarEstado(pedido.id, "PAGO_ACEPTADO");
      mostrarToast(`💳 Pago aceptado para el pedido ${codigo}`);
      recargar(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Revierte el pedido directamente a CREADO (transición permitida desde EN_PREPARACION).
  // El backend anula la venta asentada en caja al dejar de estar el pago confirmado.
  const revertirACreado = (pedidoId, codigo) =>
    cambiarEstado(pedidoId, "CREADO", `↩ Pedido ${codigo} devuelto a nuevos`);


  const revertirAEnProceso = async (pedidoId, codigo) => {
    await cambiarEstado(
      pedidoId,
      "EN_PREPARACION",
      `↩ Pedido ${codigo} devuelto a proceso`,
    );
  };

  const manejarExportarRegistro = async () => {
    try {
      setError(null);
      await descargarInformeCompleto("dia");
    } catch (err) {
      setError(err.message);
    }
  };


  const cumpleFiltros = (pedido) => {
    if (soloConGrabado && !tieneGrabadoPersonalizado(pedido)) {
      return false;
    }

    const termino = normalizarTexto(busqueda.trim());
    if (!termino) return true;

    const coincideCodigo = normalizarTexto(pedido.codigo).includes(termino);
    const coincideId = String(pedido.id).includes(termino);

    const lineas = obtenerLineasPedido(pedido);
    const coincideProducto = lineas.some((linea) => {
      const nombreProd = normalizarTexto(
        linea.productoNombre || linea.nombre || `Producto #${linea.productoId}`,
      );
      const textoPers = normalizarTexto(linea.textoPersonalizado);
      const tallaProd = normalizarTexto(linea.talla);
      const varianteProd = normalizarTexto(linea.variante);
      return (
        nombreProd.includes(termino) ||
        textoPers.includes(termino) ||
        tallaProd.includes(termino) ||
        varianteProd.includes(termino)
      );
    });

    return coincideCodigo || coincideId || coincideProducto;
  };

  const creadosFiltrados = pedidosCreados.filter(cumpleFiltros);
  const enProcesoFiltrados = pedidosEnProceso.filter(cumpleFiltros);
  const listosFiltrados = pedidosListos.filter(cumpleFiltros);
  const hayFiltrosActivos = busqueda.trim().length > 0 || soloConGrabado;

  if (loading) {
    return <ReactorLoader size={140} text="Cargando pedidos del almacén..." />;
  }

  return (
    <div className="preparacion-container">
      <div className="preparacion-header">
        <h2>📦 Preparación de Pedidos</h2>

        <div className="preparacion-controles">
          <div className="buscador-preparacion-wrapper">
            <input
              type="text"
              className="input-buscador-preparacion"
              placeholder="🔍 Buscar por código (AV-1010) o producto (Spiderman)..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button
                type="button"
                className="btn-limpiar-busqueda"
                onClick={() => setBusqueda("")}
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            className={`btn-filtro-grabado ${soloConGrabado ? "activo" : ""}`}
            onClick={() => setSoloConGrabado(!soloConGrabado)}
            title="Mostrar únicamente pedidos con texto personalizado"
          >
            ⚡ Solo con grabado
          </button>

          <button
            type="button"
            className="btn-filtro-grabado btn-postventa-abrir"
            onClick={() => setPostventaAbierta(true)}
            title="Devoluciones y cambios de comandas entregadas"
          >
            🛠️ Postventa
          </button>

          <button
            type="button"
            className="btn-filtro-grabado"
            onClick={() => setDescuentosAbiertos(true)}
            title="Control de Descuentos y Promociones"
          >
            🏷️ Control de Descuentos y Promociones
          </button>

          <button
            type="button"
            className="btn-filtro-grabado"
            onClick={() => setMetricasAbiertas(true)}
            title="Panel de métricas contables y saldo de caja registradora"
          >
            💰 Métricas de Caja
          </button>

          <button
            type="button"
            className="btn-stark-exportar"
            onClick={manejarExportarRegistro}
            title="Descargar informe de ventas, devoluciones y caja"
          >
            📊 Descargar Registro de Ventas
          </button>
        </div>
      </div>

      {(error || isOffline) && (
        <div className="error-banner">
          <span>
            {error ||
              "📡 Enlace HUD sin conexión con el servidor Stark. Reintentando sincronización en segundo plano..."}
          </span>
        </div>
      )}

      <div className="tablero-columnas tres-columnas">
        <ColumnaKanban
          titulo="Nuevos pedidos"
          tipo="creados"
          pedidos={creadosFiltrados}
          mensajeVacio="No hay pedidos pendientes"
          hayFiltrosActivos={hayFiltrosActivos}
          alCancelar={setPedidoACancelar}
          alPedirPago={setPedidoAPagoModal}
          alCambiarEstado={cambiarEstado}
        />

        <ColumnaKanban
          titulo="En proceso"
          tipo="proceso"
          pedidos={enProcesoFiltrados}
          mensajeVacio="No hay pedidos en preparación"
          hayFiltrosActivos={hayFiltrosActivos}
          lineasCompletadas={lineasCompletadas}
          alAlternarLinea={alternarLineaCompletada}
          alCancelar={setPedidoACancelar}
          alCambiarEstado={cambiarEstado}
          alRevertirACreado={revertirACreado}
        />

        <ColumnaKanban
          titulo="Listos en mostrador"
          tipo="listos"
          pedidos={listosFiltrados}
          mensajeVacio="No hay pedidos listos"
          hayFiltrosActivos={hayFiltrosActivos}
          alCancelar={setPedidoACancelar}
          alRevertirAEnProceso={revertirAEnProceso}
          alEntregar={entregarPedido}
        />
      </div>


      {toastMensaje && (
        <div className="stark-toast-notificacion">{toastMensaje}</div>
      )}

      {postventaAbierta && (
        <ModalPostventa
          alCerrar={() => setPostventaAbierta(false)}
          alCompletar={mostrarToast}
        />
      )}

      {metricasAbiertas && (
        <PanelMetricas alCerrar={() => setMetricasAbiertas(false)} />
      )}

      {descuentosAbiertos && (
        <PanelDescuentos
          alCerrar={() => setDescuentosAbiertos(false)}
          alNotificar={mostrarToast}
        />
      )}

      {pedidoACancelar && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>⚠️ Confirmar Cancelación</h3>
            <p>
              ¿Está seguro que desea cancelar el pedido{" "}
              <strong>{pedidoACancelar.codigo}</strong>?
            </p>
            <div className="modal-acciones">
              <button
                type="button"
                className="btn-modal btn-modal-secundario"
                onClick={() => setPedidoACancelar(null)}
              >
                Volver
              </button>
              <button
                type="button"
                className="btn-modal btn-modal-peligro"
                onClick={ejecutarCancelacion}
              >
                Sí, cancelar pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {pedidoAPagoModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-pago">
            <h3>💳 Confirmación de Pago</h3>
            <p>
              ¿Desea aceptar y verificar el pago para el pedido{" "}
              <strong>{pedidoAPagoModal.codigo}</strong>?
            </p>
            <div className="modal-acciones">
              <button
                type="button"
                className="btn-modal btn-modal-secundario"
                onClick={() => setPedidoAPagoModal(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-modal btn-modal-exito"
                onClick={confirmarPago}
              >
                Confirmar Pago Aceptado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}