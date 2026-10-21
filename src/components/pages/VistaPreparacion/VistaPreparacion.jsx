import { useState, useEffect, useCallback } from 'react';
import { pedidoService } from '../../../services/pedidoService';
import ReactorLoader from '../../ReactorLoader';
import './VistaPreparacion.css';

export default function VistaPreparacion() {
  const [pedidosCreados, setPedidosCreados] = useState([]);
  const [pedidosEnProceso, setPedidosEnProceso] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarPedidos = useCallback(async (silencioso = false) => {
    try {
      if (!silencioso) setError(null);
      const [creadosRes, enProcesoRes] = await Promise.all([
        pedidoService.obtenerPorEstado('CREADO'),
        pedidoService.obtenerPorEstado('EN_PREPARACION'),
      ]);

      setPedidosCreados(creadosRes?.content || creadosRes || []);
      setPedidosEnProceso(enProcesoRes?.content || enProcesoRes || []);
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

  const cambiarEstado = async (pedidoId, nuevoEstado) => {
    try {
      await pedidoService.actualizarEstado(pedidoId, nuevoEstado);
      cargarPedidos(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <ReactorLoader size={140} text="Cargando pedidos del almacén..." />;
  }

  return (
    <div className="preparacion-container">
      <div className="preparacion-header">
        <h2>📦 Preparación de Pedidos</h2>
        <button className="btn-recargar" onClick={() => cargarPedidos(false)}>
          ↻ Actualizar Tablero
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="tablero-columnas">
        {/* Columna 1: Pedidos Nuevos (CREADO) */}
        <section className="columna">
          <div className="columna-titulo">
            <span>Nuevos (CREADO)</span>
            <span>{pedidosCreados.length}</span>
          </div>

          <div className="pedidos-lista">
            {pedidosCreados.length === 0 ? (
              <p className="vacio-texto">No hay pedidos pendientes</p>
            ) : (
              pedidosCreados.map((pedido) => (
                <article key={pedido.id} className="pedido-card">
                  <div className="pedido-card-header">
                    <span className="pedido-codigo">{pedido.codigo}</span>
                    <small>ID: {pedido.id}</small>
                  </div>

                  <ul className="lineas-list">
                    {(pedido.lineas || pedido.productos)?.map((linea, idx) => (
                      <li key={linea.id || idx} className="linea-item">
                        <strong>{linea.cantidad}x</strong> {linea.productoNombre || `Producto #${linea.productoId}`}
                        {linea.textoPersonalizado && (
                          <div className="linea-personalizado">
                            ✏️ "{linea.textoPersonalizado}"
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>

                  <button
                    className="btn-accion btn-iniciar"
                    onClick={() => cambiarEstado(pedido.id, 'EN_PREPARACION')}
                  >
                    Iniciar Preparación
                  </button>
                </article>
              ))
            )}
          </div>
        </section>

        {/* Columna 2: Pedidos En Proceso (EN_PREPARACION) */}
        <section className="columna">
          <div className="columna-titulo">
            <span>En Proceso (EN_PREPARACION)</span>
            <span>{pedidosEnProceso.length}</span>
          </div>

          <div className="pedidos-lista">
            {pedidosEnProceso.length === 0 ? (
              <p className="vacio-texto">No hay pedidos en preparación</p>
            ) : (
              pedidosEnProceso.map((pedido) => (
                <article key={pedido.id} className="pedido-card">
                  <div className="pedido-card-header">
                    <span className="pedido-codigo">{pedido.codigo}</span>
                    <small>ID: {pedido.id}</small>
                  </div>

                  <ul className="lineas-list">
                    {(pedido.lineas || pedido.productos)?.map((linea, idx) => (
                      <li key={linea.id || idx} className="linea-item">
                        <strong>{linea.cantidad}x</strong> {linea.productoNombre || `Producto #${linea.productoId}`}
                        {linea.textoPersonalizado && (
                          <div className="linea-personalizado">
                            ✏️ "{linea.textoPersonalizado}"
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>

                  <button
                    className="btn-accion btn-completar"
                    onClick={() => cambiarEstado(pedido.id, 'PEDIDO_LISTO')}
                  >
                    Marcar como Listo
                  </button>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}