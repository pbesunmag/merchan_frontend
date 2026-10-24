import { useState, useEffect, useCallback } from 'react';
import { pedidoService } from '../../../services/pedidoService';
import ReactorLoader from '../../ReactorLoader';
import './VistaPreparacion.css';

export default function VistaPreparacion() {
  const [pedidosCreados, setPedidosCreados] = useState([]);
  const [pedidosEnProceso, setPedidosEnProceso] = useState([]);
  const [pedidosListos, setPedidosListos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [soloConGrabado, setSoloConGrabado] = useState(false);
  const [pedidoACancelar, setPedidoACancelar] = useState(null);
  
  const [pagosAceptados, setPagosAceptados] = useState({});
  const [pedidoAPagoModal, setPedidoAPagoModal] = useState(null);
  const [toastMensaje, setToastMensaje] = useState(null);
  const [lineasCompletadas, setLineasCompletadas] = useState({});

  const mostrarToast = (texto) => {
    setToastMensaje(texto);
    setTimeout(() => {
      setToastMensaje(null);
    }, 2500);
  };

  const alternarLineaCompletada = (pedidoId, indiceLinea) => {
    const clave = `${pedidoId}-${indiceLinea}`;
    setLineasCompletadas((prev) => ({
      ...prev,
      [clave]: !prev[clave],
    }));
  };

  const [ultimasEntregas, setUltimasEntregas] = useState(() => {
    try {
      const guardadas = localStorage.getItem('stark_ultimas_entregas');
      return guardadas ? JSON.parse(guardadas) : [];
    } catch (errInit) {
      console.warn(errInit);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('stark_ultimas_entregas', JSON.stringify(ultimasEntregas));
    } catch (errStorage) {
      console.warn(errStorage);
    }
  }, [ultimasEntregas]);

  const cargarPedidos = useCallback(async (silencioso = false) => {
    try {
      if (!silencioso) setError(null);
      const [creadosRes, enProcesoRes, listosRes] = await Promise.all([
        pedidoService.obtenerPorEstado('CREADO'),
        pedidoService.obtenerPorEstado('EN_PREPARACION'),
        pedidoService.obtenerPorEstado('PEDIDO_LISTO'),
      ]);

      setPedidosCreados(creadosRes?.content || creadosRes || []);
      setPedidosEnProceso(enProcesoRes?.content || enProcesoRes || []);
      setPedidosListos(listosRes?.content || listosRes || []);
    } catch (err) {
      if (!silencioso) setError(err.message);
    } finally {
      if (!silencioso) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initFetch = async () => {
      if (isMounted) {
        await cargarPedidos(false);
      }
    };

    initFetch();
    const intervalo = setInterval(() => {
      if (isMounted) cargarPedidos(true);
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(intervalo);
    };
  }, [cargarPedidos]);

  const cambiarEstado = async (pedidoId, nuevoEstado, mensajeToast = null) => {
    try {
      await pedidoService.actualizarEstado(pedidoId, nuevoEstado);
      if (mensajeToast) mostrarToast(mensajeToast);
      cargarPedidos(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const entregarPedido = async (pedido) => {
    try {
      await pedidoService.actualizarEstado(pedido.id, 'ENTREGADO');
      
      const codigoEntregado = pedido.codigo || `AV-${pedido.id}`;
      const horaActual = new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const nuevoRegistro = {
        id: pedido.id,
        codigo: codigoEntregado,
        horaEntrega: horaActual,
      };

      setUltimasEntregas((prev) => {
        const sinDuplicado = prev.filter((item) => item.id !== pedido.id);
        return [nuevoRegistro, ...sinDuplicado].slice(0, 5);
      });

      mostrarToast(`✅ Pedido ${codigoEntregado} registrado como entregado`);
      cargarPedidos(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const ejecutarCancelacion = async () => {
    if (!pedidoACancelar) return;
    const codigo = pedidoACancelar.codigo || `AV-${pedidoACancelar.id}`;
    await cambiarEstado(pedidoACancelar.id, 'CANCELADO', `⚠️ Pedido ${codigo} cancelado`);
    setPedidoACancelar(null);
  };

  const confirmarPago = () => {
    if (!pedidoAPagoModal) return;
    setPagosAceptados((prev) => ({
      ...prev,
      [pedidoAPagoModal.id]: true,
    }));
    const codigo = pedidoAPagoModal.codigo || `AV-${pedidoAPagoModal.id}`;
    mostrarToast(`💳 Pago aceptado para el pedido ${codigo}`);
    setPedidoAPagoModal(null);
  };

  const revertirACreado = async (pedidoId, codigo) => {
    setPagosAceptados((prev) => ({
      ...prev,
      [pedidoId]: true,
    }));
    await cambiarEstado(pedidoId, 'CREADO', `↩ Pedido ${codigo} devuelto a nuevos`);
  };

  const revertirAEnProceso = async (pedidoId, codigo) => {
    await cambiarEstado(pedidoId, 'EN_PREPARACION', `↩ Pedido ${codigo} devuelto a proceso`);
  };

  const normalizarTexto = (texto) => {
    if (!texto) return '';
    return String(texto)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  const tieneGrabadoPersonalizado = (pedido) => {
    const lineas = pedido.lineas || pedido.productos || [];
    return lineas.some(
      (linea) =>
        linea.textoPersonalizado &&
        String(linea.textoPersonalizado).trim().length > 0
    );
  };

  const calcularTotalUnidades = (pedido) => {
    const lineas = pedido.lineas || pedido.productos || [];
    return lineas.reduce((acc, linea) => acc + (Number(linea.cantidad) || 1), 0);
  };

  const cumpleFiltros = (pedido) => {
    if (soloConGrabado && !tieneGrabadoPersonalizado(pedido)) {
      return false;
    }

    const termino = normalizarTexto(busqueda.trim());
    if (!termino) return true;

    const coincideCodigo = normalizarTexto(pedido.codigo).includes(termino);
    const coincideId = String(pedido.id).includes(termino);

    const lineas = pedido.lineas || pedido.productos || [];
    const coincideProducto = lineas.some((linea) => {
      const nombreProd = normalizarTexto(
        linea.productoNombre || linea.nombre || `Producto #${linea.productoId}`
      );
      const textoPers = normalizarTexto(linea.textoPersonalizado);
      const tallaProd = normalizarTexto(linea.talla);
      return (
        nombreProd.includes(termino) ||
        textoPers.includes(termino) ||
        tallaProd.includes(termino)
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
                onClick={() => setBusqueda('')}
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            className={`btn-filtro-grabado ${soloConGrabado ? 'activo' : ''}`}
            onClick={() => setSoloConGrabado(!soloConGrabado)}
            title="Mostrar únicamente pedidos con texto personalizado"
          >
            ⚡ Solo con grabado
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="tablero-columnas tres-columnas">
        <section className="columna">
          <div className="columna-titulo">
            <span className="columna-texto-titulo">Nuevos pedidos</span>
            <span className="columna-contador">{creadosFiltrados.length}</span>
          </div>

          <div className="pedidos-lista">
            {creadosFiltrados.length === 0 ? (
              <p className="vacio-texto">
                {hayFiltrosActivos
                  ? 'Sin resultados para los filtros aplicados'
                  : 'No hay pedidos pendientes'}
              </p>
            ) : (
              creadosFiltrados.map((pedido) => {
                const totalUds = calcularTotalUnidades(pedido);
                const esPersonalizado = tieneGrabadoPersonalizado(pedido);
                const pagoAceptado = pagosAceptados[pedido.id];
                const codigoPedido = pedido.codigo || `AV-${pedido.id}`;

                return (
                  <article key={pedido.id} className="pedido-card">
                    <div className="pedido-card-header">
                      <span className="pedido-codigo">{codigoPedido}</span>
                      <div className="pedido-header-badges">
                        {esPersonalizado && (
                          <span className="badge-grabado-alerta" title="Este pedido incluye artículos personalizados">
                            ⚡ REQUIERE GRABADO
                          </span>
                        )}
                        <span className="badge-unidades" title="Total de artículos">
                          📦 {totalUds} {totalUds === 1 ? 'ud.' : 'uds.'}
                        </span>
                        <button
                          type="button"
                          className="btn-cancelar-pedido"
                          onClick={() => setPedidoACancelar(pedido)}
                          title="Cancelar pedido"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <ul className="lineas-list">
                      {(pedido.lineas || pedido.productos)?.map((linea, idx) => (
                        <li key={linea.id || idx} className="linea-item">
                          <div className="linea-principal">
                            <span>
                              <strong>{linea.cantidad}x</strong>{' '}
                              {linea.productoNombre || `Producto #${linea.productoId}`}
                            </span>
                            {linea.talla && (
                              <span className="badge-talla-prep">
                                Talla {linea.talla}
                              </span>
                            )}
                          </div>
                          {linea.textoPersonalizado && (
                            <div className="linea-personalizado">
                              ✏️ "{linea.textoPersonalizado}"
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>

                    <div className="pedido-acciones-fila">
                      <button
                        type="button"
                        className={`btn-accion ${pagoAceptado ? 'btn-pago-aceptado' : 'btn-pago-ok'}`}
                        onClick={() => !pagoAceptado && setPedidoAPagoModal(pedido)}
                        disabled={pagoAceptado}
                        title={pagoAceptado ? "El pago ya ha sido verificado" : "Verificar estado del pago"}
                      >
                        {pagoAceptado ? '✓ Pago ya aceptado' : '💳 Pago Aceptado'}
                      </button>
                      <button
                        className={`btn-accion btn-iniciar ${!pagoAceptado ? 'btn-deshabilitado' : ''}`}
                        onClick={() => pagoAceptado && cambiarEstado(pedido.id, 'EN_PREPARACION', `🚀 Pedido ${codigoPedido} en preparación`)}
                        disabled={!pagoAceptado}
                        title={!pagoAceptado ? "Debe aceptar el pago antes de iniciar la preparación" : "Iniciar preparación"}
                      >
                        Iniciar Preparación
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <section className="columna">
          <div className="columna-titulo">
            <span className="columna-texto-titulo">En proceso</span>
            <span className="columna-contador">{enProcesoFiltrados.length}</span>
          </div>

          <div className="pedidos-lista">
            {enProcesoFiltrados.length === 0 ? (
              <p className="vacio-texto">
                {hayFiltrosActivos
                  ? 'Sin resultados para los filtros aplicados'
                  : 'No hay pedidos en preparación'}
              </p>
            ) : (
              enProcesoFiltrados.map((pedido) => {
                const totalUds = calcularTotalUnidades(pedido);
                const esPersonalizado = tieneGrabadoPersonalizado(pedido);
                const codigoPedido = pedido.codigo || `AV-${pedido.id}`;

                return (
                  <article key={pedido.id} className="pedido-card">
                    <div className="pedido-card-header">
                      <span className="pedido-codigo">{codigoPedido}</span>
                      <div className="pedido-header-badges">
                        {esPersonalizado && (
                          <span className="badge-grabado-alerta" title="Este pedido incluye artículos personalizados">
                            ⚡ REQUIERE GRABADO
                          </span>
                        )}
                        <span className="badge-unidades" title="Total de artículos">
                          📦 {totalUds} {totalUds === 1 ? 'ud.' : 'uds.'}
                        </span>
                        <button
                          type="button"
                          className="btn-cancelar-pedido"
                          onClick={() => setPedidoACancelar(pedido)}
                          title="Cancelar pedido"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <ul className="lineas-list">
                      {(pedido.lineas || pedido.productos)?.map((linea, idx) => {
                        const claveCheck = `${pedido.id}-${idx}`;
                        const estaCompletada = !!lineasCompletadas[claveCheck];

                        return (
                          <li
                            key={linea.id || idx}
                            className={`linea-item linea-checklist ${estaCompletada ? 'completada' : ''}`}
                            onClick={() => alternarLineaCompletada(pedido.id, idx)}
                            title="Haz clic para marcar como preparado"
                          >
                            <div className="linea-principal">
                              <span>
                                <span className="check-icono">{estaCompletada ? '✅' : '⬜'}</span>
                                <strong>{linea.cantidad}x</strong>{' '}
                                {linea.productoNombre || `Producto #${linea.productoId}`}
                              </span>
                              {linea.talla && (
                                <span className="badge-talla-prep">
                                  Talla {linea.talla}
                                </span>
                              )}
                            </div>
                            {linea.textoPersonalizado && (
                              <div className="linea-personalizado">
                                ✏️ "{linea.textoPersonalizado}"
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>

                    <div className="pedido-acciones-fila">
                      <button
                        className="btn-accion btn-revertir"
                        onClick={() => revertirACreado(pedido.id, codigoPedido)}
                        title="Devolver pedido a Nuevos pedidos"
                      >
                        ↩ Revertir
                      </button>
                      <button
                        className="btn-accion btn-completar"
                        onClick={() => cambiarEstado(pedido.id, 'PEDIDO_LISTO', `✨ Pedido ${codigoPedido} marcado como listo`)}
                      >
                        Marcar como Listo
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <section className="columna">
          <div className="columna-titulo">
            <span className="columna-texto-titulo">Listos en mostrador</span>
            <span className="columna-contador">{listosFiltrados.length}</span>
          </div>

          <div className="pedidos-lista">
            {listosFiltrados.length === 0 ? (
              <p className="vacio-texto">
                {hayFiltrosActivos
                  ? 'Sin resultados para los filtros aplicados'
                  : 'No hay pedidos listos'}
              </p>
            ) : (
              listosFiltrados.map((pedido) => {
                const totalUds = calcularTotalUnidades(pedido);
                const esPersonalizado = tieneGrabadoPersonalizado(pedido);
                const codigoPedido = pedido.codigo || `AV-${pedido.id}`;

                return (
                  <article key={pedido.id} className="pedido-card">
                    <div className="pedido-card-header">
                      <span className="pedido-codigo">{codigoPedido}</span>
                      <div className="pedido-header-badges">
                        {esPersonalizado && (
                          <span className="badge-grabado-alerta" title="Este pedido incluye artículos personalizados">
                            ⚡ REQUIERE GRABADO
                          </span>
                        )}
                        <span className="badge-unidades" title="Total de artículos">
                          📦 {totalUds} {totalUds === 1 ? 'ud.' : 'uds.'}
                        </span>
                        <button
                          type="button"
                          className="btn-cancelar-pedido"
                          onClick={() => setPedidoACancelar(pedido)}
                          title="Cancelar pedido"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <ul className="lineas-list">
                      {(pedido.lineas || pedido.productos)?.map((linea, idx) => (
                        <li key={linea.id || idx} className="linea-item">
                          <div className="linea-principal">
                            <span>
                              <strong>{linea.cantidad}x</strong>{' '}
                              {linea.productoNombre || `Producto #${linea.productoId}`}
                            </span>
                            {linea.talla && (
                              <span className="badge-talla-prep">
                                Talla {linea.talla}
                              </span>
                            )}
                          </div>
                          {linea.textoPersonalizado && (
                            <div className="linea-personalizado">
                              ✏️ "{linea.textoPersonalizado}"
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>

                    <div className="pedido-acciones-fila">
                      <button
                        className="btn-accion btn-revertir"
                        onClick={() => revertirAEnProceso(pedido.id, codigoPedido)}
                        title="Devolver pedido a En proceso"
                      >
                        ↩ Revertir
                      </button>
                      <button
                        className="btn-accion btn-entregar"
                        onClick={() => entregarPedido(pedido)}
                        title="Entregar pedido al cliente"
                      >
                        ✓ Entregado al Cliente
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>

      {toastMensaje && (
        <div className="stark-toast-notificacion">
          {toastMensaje}
        </div>
      )}

      {pedidoACancelar && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>⚠️ Confirmar Cancelación</h3>
            <p>
              ¿Está seguro que desea cancelar el pedido{' '}
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
              ¿Desea aceptar y verificar el pago para el pedido{' '}
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