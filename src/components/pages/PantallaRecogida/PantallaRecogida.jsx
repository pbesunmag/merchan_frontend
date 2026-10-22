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

  const [filtroCodigo, setFiltroCodigo] = useState("");
  const inputBusquedaRef = useRef(null);

  const [ultimasEntregas, setUltimasEntregas] = useState(() => {
    try {
      const guardadas = localStorage.getItem("stark_ultimas_entregas");
      return guardadas ? JSON.parse(guardadas).slice(0, 5) : [];
    } catch (errInit) {
      console.warn("Error al cargar entregas iniciales:", errInit);
      return [];
    }
  });

  const sincronizarEntregas = useCallback(() => {
    try {
      const guardadas = localStorage.getItem("stark_ultimas_entregas");
      if (guardadas) {
        setUltimasEntregas(JSON.parse(guardadas).slice(0, 5));
      }
    } catch (errSync) {
      console.warn("Error al sincronizar entregas:", errSync);
    }
  }, []);

  const consultarPedidos = useCallback(async (silencioso = false) => {
    try {
      if (!silencioso) setError(null);

      const [procesoRes, listosRes] = await Promise.all([
        pedidoService.obtenerPorEstado("EN_PREPARACION"),
        pedidoService.obtenerPorEstado("PEDIDO_LISTO"),
      ]);

      setPedidosEnProceso(procesoRes?.content || procesoRes || []);
      setPedidosListos(listosRes?.content || listosRes || []);
      sincronizarEntregas();
    } catch (errConsulta) {
      console.warn(errConsulta);
      if (!silencioso) {
        setError(
          "No se pudo sincronizar con el servidor central de Stark Industries."
        );
      }
    } finally {
      if (!silencioso) {
        setLoading(false);
      }
    }
  }, [sincronizarEntregas]);

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

    const manejarStorageChange = (e) => {
      if (e.key === "stark_ultimas_entregas") {
        sincronizarEntregas();
      }
    };

    window.addEventListener("storage", manejarStorageChange);

    return () => {
      montado = false;
      clearInterval(intervalo);
      window.removeEventListener("storage", manejarStorageChange);
    };
  }, [consultarPedidos, sincronizarEntregas]);

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

      {error && (
        <div className="recogida-error-banner">
          <span>⚠️ {error}</span>
          <button type="button" onClick={() => consultarPedidos(false)}>
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