import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { pedidoService } from "../../../services/pedidoService";
import ReactorLoader from "../../ReactorLoader";
import "./PantallaRecogida.css";
import loaderPreparacion from "../../../assets/loader7.svg";

export default function PantallaRecogida() {
  const [pedidosEnProceso, setPedidosEnProceso] = useState([]);
  const [pedidosListos, setPedidosListos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [procesandoEntrega, setProcesandoEntrega] = useState(false);

  // 1. Estado para el buscador de código en tiempo real
  const [filtroCodigo, setFiltroCodigo] = useState("");
  const inputBusquedaRef = useRef(null);

  // 2. Estado para el historial de las últimas 5 entregas (persistido en sessionStorage)
  const [ultimasEntregas, setUltimasEntregas] = useState(() => {
    try {
      const guardadas = sessionStorage.getItem("stark_ultimas_entregas");
      return guardadas ? JSON.parse(guardadas) : [];
    } catch {
      return [];
    }
  });

  // Guardar en sessionStorage cada vez que cambie ultimasEntregas
  useEffect(() => {
    try {
      sessionStorage.setItem(
        "stark_ultimas_entregas",
        JSON.stringify(ultimasEntregas),
      );
    } catch {
      // Ignorar errores de almacenamiento
    }
  }, [ultimasEntregas]);

  const consultarPedidos = useCallback(async (silencioso = false) => {
    try {
      if (!silencioso) setError(null);

      const [procesoRes, listosRes] = await Promise.all([
        pedidoService.obtenerPorEstado("EN_PREPARACION"),
        pedidoService.obtenerPorEstado("PEDIDO_LISTO"),
      ]);

      setPedidosEnProceso(procesoRes?.content || procesoRes || []);
      setPedidosListos(listosRes?.content || listosRes || []);
    } catch (err) {
      console.error("Error al consultar pantalla de recogida:", err);
      if (!silencioso) {
        setError(
          "No se pudo sincronizar con el servidor central de Stark Industries.",
        );
      }
    } finally {
      if (!silencioso) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let montado = true;

    const inicializar = async () => {
      if (montado) {
        await consultarPedidos(false);
      }
    };

    inicializar();

    const intervalo = setInterval(() => {
      if (montado) {
        consultarPedidos(true);
      }
    }, 4000);

    return () => {
      montado = false;
      clearInterval(intervalo);
    };
  }, [consultarPedidos]);

  // Manejo de tecla Escape para limpiar el buscador o cerrar el modal
  useEffect(() => {
    const manejarKeyDown = (e) => {
      if (e.key === "Escape") {
        if (pedidoSeleccionado && !procesandoEntrega) {
          setPedidoSeleccionado(null);
        } else if (filtroCodigo) {
          setFiltroCodigo("");
          inputBusquedaRef.current?.blur();
        }
      }
    };

    window.addEventListener("keydown", manejarKeyDown);
    return () => window.removeEventListener("keydown", manejarKeyDown);
  }, [filtroCodigo, pedidoSeleccionado, procesandoEntrega]);

  // Filtrado optimizado con useMemo para ambas columnas
  const terminoLimpio = filtroCodigo.trim().toUpperCase();

  const pedidosEnProcesoFiltrados = useMemo(() => {
    if (!terminoLimpio) return pedidosEnProceso;
    return pedidosEnProceso.filter((pedido) => {
      const codigo = (pedido.codigo || `AV-${pedido.id}`).toUpperCase();
      return codigo.includes(terminoLimpio);
    });
  }, [pedidosEnProceso, terminoLimpio]);

  const pedidosListosFiltrados = useMemo(() => {
    if (!terminoLimpio) return pedidosListos;
    return pedidosListos.filter((pedido) => {
      const codigo = (pedido.codigo || `AV-${pedido.id}`).toUpperCase();
      return codigo.includes(terminoLimpio);
    });
  }, [pedidosListos, terminoLimpio]);

  const limpiarFiltro = () => {
    setFiltroCodigo("");
    inputBusquedaRef.current?.focus();
  };

  const abrirModalConfirmacion = (pedido) => {
    setPedidoSeleccionado(pedido);
  };

  const cerrarModal = () => {
    if (procesandoEntrega) return;
    setPedidoSeleccionado(null);
  };

  const confirmarRecogida = async () => {
    if (!pedidoSeleccionado) return;

    try {
      setProcesandoEntrega(true);
      setError(null);

      try {
        await pedidoService.actualizarEstado(pedidoSeleccionado.id, "RECOGIDO");
      } catch {
        await pedidoService.actualizarEstado(
          pedidoSeleccionado.id,
          "ENTREGADO",
        );
      }

      const codigoEntregado =
        pedidoSeleccionado.codigo || `AV-${pedidoSeleccionado.id}`;
      const horaActual = new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const nuevoRegistro = {
        id: pedidoSeleccionado.id,
        codigo: codigoEntregado,
        horaEntrega: horaActual,
      };

      // Añadir al inicio del historial manteniendo máximo 5 entregas
      setUltimasEntregas((prev) => {
        const sinDuplicado = prev.filter(
          (item) => item.id !== pedidoSeleccionado.id,
        );
        return [nuevoRegistro, ...sinDuplicado].slice(0, 5);
      });

      setPedidosListos((prev) =>
        prev.filter((p) => p.id !== pedidoSeleccionado.id),
      );
      setPedidoSeleccionado(null);
      await consultarPedidos(true);
    } catch (err) {
      console.error("Error al marcar el pedido como recogido:", err);
      setError(err.message || "Error al registrar la entrega del suministro.");
      setPedidoSeleccionado(null);
    } finally {
      setProcesandoEntrega(false);
    }
  };

  if (loading) {
    return (
      <ReactorLoader
        size={140}
        text="Sincronizando pantalla de recogida Stark..."
      />
    );
  }

  return (
    <div className="recogida-container">
      <header className="recogida-header">
        <div className="recogida-header-badge">
          STARK LOGISTICS HUD // TERMINAL DE ENTREGA
        </div>
        <h1 className="recogida-titulo">ESTADO DE PEDIDOS</h1>
        <p className="recogida-subtitulo">
          Acércate al mostrador cuando tu código aparezca en la columna de
          recogida.
          <span className="recogida-operario-hint">
            {" "}
            (Operario: pulsa sobre un pedido listo para confirmar su entrega)
          </span>
        </p>

        {/* BUSCADOR / FILTRO RÁPIDO DE CÓDIGO */}
        <div className="recogida-buscador-wrapper">
          <div className="recogida-buscador-box">
            <span className="buscador-icono" aria-hidden="true">
              🔍
            </span>
            <input
              ref={inputBusquedaRef}
              type="text"
              className="recogida-buscador-input"
              placeholder="Buscar (ej. 1014 o AV-1014)"
              value={filtroCodigo}
              onChange={(e) => setFiltroCodigo(e.target.value)}
              aria-label="Filtrar pedidos por código"
            />
            {filtroCodigo && (
              <button
                type="button"
                className="btn-limpiar-filtro"
                onClick={limpiarFiltro}
                title="Limpiar filtro (Esc)"
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>
          {terminoLimpio && (
            <div className="buscador-estado-resultados">
              Mostrando coincidencias para <strong>"{terminoLimpio}"</strong>{" "}
              (pulsa <kbd>Esc</kbd> para limpiar)
            </div>
          )}
        </div>
      </header>

      {error && (
        <div className="recogida-error-banner">
          <span>⚠️ {error}</span>
          <button type="button" onClick={() => consultarPedidos(false)}>
            Reintentar
          </button>
        </div>
      )}

      <div className="recogida-split-board">
        {/* COLUMNA IZQUIERDA: EN PREPARACIÓN */}
        <section className="recogida-columna columna-preparacion">
          <div className="columna-header">
            <h2 className="columna-titulo">
              <img
                src={loaderPreparacion}
                alt="En preparación"
                className="loader-svg-preparacion"
              />
              EN PREPARACIÓN
            </h2>
            <span className="columna-badge badge-ambar">
              {pedidosEnProcesoFiltrados.length} en curso
            </span>
          </div>

          {pedidosEnProcesoFiltrados.length === 0 ? (
            <div className="estado-vacio">
              <span className="estado-vacio-icono">🛠️</span>
              <p>
                {terminoLimpio
                  ? `Sin coincidencias para "${terminoLimpio}" en preparación`
                  : "Sin pedidos en cola de ensamblaje"}
              </p>
            </div>
          ) : (
            <div className="tarjetas-grid">
              {pedidosEnProcesoFiltrados.map((pedido) => {
                const codigoMostrar = pedido.codigo || `AV-${pedido.id}`;
                return (
                  <div
                    key={pedido.id}
                    className={`codigo-card card-preparacion ${terminoLimpio ? "card-resaltada" : ""}`}
                  >
                    <span className="card-status-dot dot-ambar" />
                    <span className="card-codigo">{codigoMostrar}</span>
                    <span className="card-etiqueta">ENSAMBLANDO...</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* COLUMNA DERECHA: LISTO PARA RECOGER */}
        <section className="recogida-columna columna-listos">
          <div className="columna-header">
            <h2 className="columna-titulo">✅ LISTO PARA RECOGER</h2>
            <span className="columna-badge badge-cian">
              {pedidosListosFiltrados.length}{" "}
              {pedidosListosFiltrados.length === 1 ? "listo" : "listos"}
            </span>
          </div>

          {pedidosListosFiltrados.length === 0 ? (
            <div className="estado-vacio">
              <span className="estado-vacio-icono">✨</span>
              <p>
                {terminoLimpio
                  ? `Sin coincidencias para "${terminoLimpio}" listos para recoger`
                  : "No hay suministros pendientes de retirada"}
              </p>
            </div>
          ) : (
            <div className="tarjetas-grid">
              {pedidosListosFiltrados.map((pedido) => {
                const codigoMostrar = pedido.codigo || `AV-${pedido.id}`;
                return (
                  <button
                    key={pedido.id}
                    type="button"
                    className={`codigo-card card-listo ${terminoLimpio ? "card-resaltada" : ""}`}
                    onClick={() => abrirModalConfirmacion(pedido)}
                    title="Haz clic para confirmar la entrega de esta comanda"
                  >
                    <span className="card-status-dot dot-cian" />
                    <span className="card-codigo">{codigoMostrar}</span>
                    <span className="card-etiqueta">PULSAR PARA ENTREGAR</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* BARRA INFERIOR DE ÚLTIMAS ENTREGAS (TICKER HUD) */}
      <aside
        className="entregas-ticker-bar"
        aria-label="Historial de entregas recientes"
      >
        <div className="ticker-etiqueta">
          <span className="ticker-icono">📦</span>
          <span>ENTREGAS RECIENTES:</span>
        </div>

        <div className="ticker-contenido">
          {ultimasEntregas.length === 0 ? (
            <span className="ticker-vacio">
              No hay registros de entregas recientes en esta sesión.
            </span>
          ) : (
            <ul className="ticker-lista">
              {ultimasEntregas.map((entrega) => (
                <li
                  key={`${entrega.id}-${entrega.horaEntrega}`}
                  className="ticker-chip"
                >
                  <span className="ticker-chip-check">✓</span>
                  <span className="ticker-chip-codigo">{entrega.codigo}</span>
                  <span className="ticker-chip-hora">
                    {entrega.horaEntrega}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* MODAL DE CONFIRMACIÓN DE ENTREGA */}
      {pedidoSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-stark" onClick={(e) => e.stopPropagation()}>
            <div className="modal-stark-header">
              <span className="modal-stark-tag">PROTOCOLO DE MOSTRADOR</span>
              <h3>⚡ ENTREGA DE SUMINISTRO</h3>
            </div>

            <p className="modal-stark-pregunta">
              ¿Confirmar la entrega y retirada de la comanda?
            </p>

            <div className="modal-codigo-destacado">
              {pedidoSeleccionado.codigo || `AV-${pedidoSeleccionado.id}`}
            </div>

            <div className="modal-stark-acciones">
              <button
                type="button"
                className="btn-modal btn-cancelar"
                onClick={cerrarModal}
                disabled={procesandoEntrega}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-modal btn-confirmar"
                onClick={confirmarRecogida}
                disabled={procesandoEntrega}
              >
                {procesandoEntrega ? "Procesando..." : "✓ Marcar como Recogido"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
