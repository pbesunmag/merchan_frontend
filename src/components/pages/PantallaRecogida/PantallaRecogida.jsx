import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { pedidoService } from "../../../services/pedidoService";
import { obtenerCodigoPedido } from "../../../utils/formatoUtils";
import { usePollingPedidos } from "../../../hooks/usePollingPedidos";
import ReactorLoader from "../../ReactorLoader";
import "./PantallaRecogida.css";
import loaderPreparacion from "../../../assets/loader7.svg";

const obtenerFechaHoy = () => {
  const ahora = new Date();
  const dia = String(ahora.getDate()).padStart(2, "0");
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const anio = ahora.getFullYear();
  return `${dia}/${mes}/${anio}`;
};

const esMismoDiaLocal = (fechaIso) => {
  if (!fechaIso) return true;
  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) return true;
  const ahora = new Date();
  return (
    fecha.getFullYear() === ahora.getFullYear() &&
    fecha.getMonth() === ahora.getMonth() &&
    fecha.getDate() === ahora.getDate()
  );
};

const formatearHoraEntrega = (fechaIso) => {
  if (!fechaIso) return "";
  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) return "";
  return fecha.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function PantallaRecogida() {
  const [pedidosEnProceso, setPedidosEnProceso] = useState([]);
  const [pedidosListos, setPedidosListos] = useState([]);
  const [ultimasEntregas, setUltimasEntregas] = useState([]);

  const [filtroCodigo, setFiltroCodigo] = useState("");
  const inputBusquedaRef = useRef(null);

  const [fechaHoraActual, setFechaHoraActual] = useState({
    fecha: "",
    hora: "",
  });

  useEffect(() => {
    const actualizarReloj = () => {
      const ahora = new Date();
      const horas = String(ahora.getHours()).padStart(2, "0");
      const minutos = String(ahora.getMinutes()).padStart(2, "0");
      const segundos = String(ahora.getSeconds()).padStart(2, "0");
      const fechaHoy = obtenerFechaHoy();

      setFechaHoraActual({
        fecha: fechaHoy,
        hora: `${horas}:${minutos}:${segundos}`,
      });
    };

    actualizarReloj();
    const timerReloj = setInterval(actualizarReloj, 1000);
    return () => clearInterval(timerReloj);
  }, []);

  const consultarPedidos = useCallback(async () => {
    try {
      const [procesoRes, listosRes, entregadosRes] = await Promise.all([
        pedidoService.obtenerPorEstado("EN_PREPARACION"),
        pedidoService.obtenerPorEstado("PEDIDO_LISTO"),
        pedidoService.obtenerPedidosPorEstado("ENTREGADO", 5),
      ]);

      setPedidosEnProceso(procesoRes?.content || procesoRes || []);
      setPedidosListos(listosRes?.content || listosRes || []);

      const listaEntregados = entregadosRes?.content || entregadosRes || [];
      const entregasHoy = (Array.isArray(listaEntregados) ? listaEntregados : [])
        .filter((pedido) =>
          esMismoDiaLocal(pedido.fechaActualizacion || pedido.fechaCreacion),
        )
        .sort((a, b) => {
          const fechaA = new Date(a.fechaActualizacion || a.fechaCreacion || 0).getTime();
          const fechaB = new Date(b.fechaActualizacion || b.fechaCreacion || 0).getTime();
          return fechaB - fechaA || (b.id || 0) - (a.id || 0);
        })
        .slice(0, 5)
        .map((pedido) => ({
          id: pedido.id,
          codigo: obtenerCodigoPedido(pedido),
          horaEntrega: formatearHoraEntrega(
            pedido.fechaActualizacion || pedido.fechaCreacion,
          ),
        }));

      setUltimasEntregas(entregasHoy);
    } catch (errConsulta) {
      console.warn(errConsulta);
      throw new Error(
        "No se pudo sincronizar con el servidor central de Stark Industries.",
        { cause: errConsulta },
      );
    }
  }, []);

  const { loading, error, isOffline, recargar } =
    usePollingPedidos(consultarPedidos);

  useEffect(() => {
    const manejarKeyDown = (e) => {
      if (e.key === "Escape" && filtroCodigo) {
        setFiltroCodigo("");
        inputBusquedaRef.current?.blur();
      }
    };

    window.addEventListener("keydown", manejarKeyDown);
    return () => window.removeEventListener("keydown", manejarKeyDown);
  }, [filtroCodigo]);

  const alternarPantallaCompleta = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn("Error al intentar activar pantalla completa:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const terminoLimpio = filtroCodigo.trim().toUpperCase();

  const pedidosEnProcesoFiltrados = useMemo(() => {
    if (!terminoLimpio) return pedidosEnProceso;
    return pedidosEnProceso.filter((pedido) => {
      const codigo = obtenerCodigoPedido(pedido).toUpperCase();
      return codigo.includes(terminoLimpio);
    });
  }, [pedidosEnProceso, terminoLimpio]);

  const pedidosListosFiltrados = useMemo(() => {
    if (!terminoLimpio) return pedidosListos;
    return pedidosListos.filter((pedido) => {
      const codigo = obtenerCodigoPedido(pedido).toUpperCase();
      return codigo.includes(terminoLimpio);
    });
  }, [pedidosListos, terminoLimpio]);

  const limpiarFiltro = () => {
    setFiltroCodigo("");
    inputBusquedaRef.current?.focus();
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
      <button
        type="button"
        onClick={alternarPantallaCompleta}
        title="Alternar modo pantalla completa"
        className="btn-pantalla-completa-stark"
      >
        ⛶
      </button>

      <header className="recogida-header">
        <div className="recogida-header-badge badge-sistema-activo">
          <span className="punto-estado-activo" />
          STARK LOGISTICS HUD // TERMINAL DE ENTREGA
        </div>
        {fechaHoraActual.hora && (
          <div className="reloj-hud-central">
            FECHA: {fechaHoraActual.fecha} &nbsp;|&nbsp; HORA CENTRAL:&nbsp;
            {fechaHoraActual.hora}
          </div>
        )}
        <h1 className="recogida-titulo">ESTADO DE PEDIDOS</h1>
        <p className="recogida-subtitulo">
          Acércate al mostrador cuando tu código aparezca en la columna de
          recogida.
        </p>

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

      {(error || isOffline) && (
        <div className="recogida-error-banner">
          <span>
            📡{" "}
            {error ||
              "Enlace HUD sin conexión temporal con el servidor Stark. Reintentando sincronización automática..."}
          </span>
          <button type="button" onClick={() => recargar(false)}>
            Reintentar
          </button>
        </div>
      )}

      <div className="recogida-split-board">
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
                const codigoMostrar = obtenerCodigoPedido(pedido);
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
                const codigoMostrar = obtenerCodigoPedido(pedido);
                return (
                  <div
                    key={pedido.id}
                    className={`codigo-card card-listo ${terminoLimpio ? "card-resaltada" : ""}`}
                  >
                    <span className="card-status-dot dot-cian" />
                    <span className="card-codigo">{codigoMostrar}</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <aside
        className="entregas-ticker-bar"
        aria-label="Historial de entregas recientes"
      >
        <div className="ticker-etiqueta">
          <span className="ticker-icono">📦</span>
          <span>ENTREGAS RECIENTES (HOY):</span>
        </div>

        <div className="ticker-contenido">
          {ultimasEntregas.length === 0 ? (
            <span className="ticker-vacio">
              No hay registros de entregas recientes en el día de hoy.
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
                  {entrega.horaEntrega && (
                    <span className="ticker-chip-hora">
                      {entrega.horaEntrega}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
