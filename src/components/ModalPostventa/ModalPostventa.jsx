import { useState, useEffect, useMemo, useCallback } from 'react';
import { pedidoService } from '../../services/pedidoService';
import { productService } from '../../services/productService';
import { cajaService } from '../../services/cajaService';
import { formatearMoneda, obtenerCodigoPedido } from '../../utils/formatoUtils';
import './ModalPostventa.css';

const obtenerLineas = (pedido) => pedido?.lineas || pedido?.productos || [];

export default function ModalPostventa({ alCerrar, alCompletar }) {
  const [pedidos, setPedidos] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const [pedidoDevolucion, setPedidoDevolucion] = useState(null);
  const [pedidoCambio, setPedidoCambio] = useState(null);
  const [lineaIdx, setLineaIdx] = useState(0);
  const [nuevoProducto, setNuevoProducto] = useState(null);
  const [filtroCatalogo, setFiltroCatalogo] = useState('');

  const cargar = useCallback(async () => {
    try {
      const [pedidosRes, productosRes] = await Promise.all([
        pedidoService.obtenerPorEstado('ENTREGADO'),
        productService.obtenerProductos(),
      ]);
      setPedidos(pedidosRes?.content || pedidosRes || []);
      setCatalogo(productosRes?.content || productosRes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(cargar, 0);
    return () => clearTimeout(id);
  }, [cargar]);

  const precioProductoCatalogo = (productoId) => {
    const prod = catalogo.find((p) => p.id === productoId);
    return Number(prod?.precio) || 0;
  };

  // Precio unitario pagado por una línea (con respaldo al precio de catálogo)
  const precioUnitarioLinea = (linea) => {
    const directo = Number(linea.precioUnitario ?? linea.precio);
    if (directo > 0) return directo;
    const cant = Number(linea.cantidad) || 1;
    const subtotal = Number(linea.subtotal);
    if (subtotal > 0) return subtotal / cant;
    return precioProductoCatalogo(linea.productoId);
  };

  const importePedido = (pedido) => {
    const total = Number(pedido.total ?? pedido.importeTotal);
    if (total > 0) return total;
    return obtenerLineas(pedido).reduce(
      (acc, l) => acc + precioUnitarioLinea(l) * (Number(l.cantidad) || 1),
      0
    );
  };

  const pedidosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return pedidos;
    return pedidos.filter(
      (p) =>
        obtenerCodigoPedido(p).toLowerCase().includes(termino) ||
        String(p.id).includes(termino)
    );
  }, [pedidos, busqueda]);

  const lineaSeleccionada = pedidoCambio ? obtenerLineas(pedidoCambio)[lineaIdx] : null;
  const cantidadLinea = Number(lineaSeleccionada?.cantidad) || 1;
  const precioActual = lineaSeleccionada ? precioUnitarioLinea(lineaSeleccionada) : 0;
  const diferencia = nuevoProducto
    ? (Number(nuevoProducto.precio) - precioActual) * cantidadLinea
    : 0;

  const catalogoFiltrado = catalogo.filter((p) =>
    String(p.nombre || '').toLowerCase().includes(filtroCatalogo.trim().toLowerCase())
  );

  const abrirCambio = (pedido) => {
    setPedidoCambio(pedido);
    setLineaIdx(0);
    setNuevoProducto(null);
    setFiltroCatalogo('');
  };

  const cerrarCambio = () => {
    setPedidoCambio(null);
    setNuevoProducto(null);
  };

  const confirmarDevolucion = async () => {
    if (!pedidoDevolucion) return;
    setProcesando(true);
    try {
      await cajaService.solicitarDevolucion(pedidoDevolucion.id);
      alCompletar?.(
        `↩️ Devolución del pedido ${obtenerCodigoPedido(pedidoDevolucion)}: reintegrar ${formatearMoneda(importePedido(pedidoDevolucion))}`
      );
      setPedidoDevolucion(null);
      await cargar();
    } catch (err) {
      setError(err.message);
      setPedidoDevolucion(null);
    } finally {
      setProcesando(false);
    }
  };

  const confirmarCambio = async () => {
    if (!pedidoCambio || !lineaSeleccionada || !nuevoProducto) return;
    setProcesando(true);
    try {
      await cajaService.solicitarCambio(pedidoCambio.id, {
        lineaId: lineaSeleccionada.id ?? null,
        productoOriginalId: lineaSeleccionada.productoId,
        nuevoProductoId: nuevoProducto.id,
        cantidad: cantidadLinea,
        diferencia: Number(diferencia.toFixed(2)),
      });
      alCompletar?.(
        `🔄 Cambio en ${obtenerCodigoPedido(pedidoCambio)}: cobrar ${formatearMoneda(diferencia)} en caja`
      );
      cerrarCambio();
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={alCerrar}>
      <div className="modal-content postventa-modal" onClick={(e) => e.stopPropagation()}>
        <div className="postventa-header">
          <h3>🛠️ Postventa · Devoluciones y Cambios</h3>
          <button type="button" className="postventa-cerrar" onClick={alCerrar} title="Cerrar">
            ✕
          </button>
        </div>

        <input
          type="text"
          className="input-buscador-preparacion postventa-buscador"
          placeholder="🔍 Buscar comanda por código (AV-1010)..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        {error && <div className="error-banner">{error}</div>}

        <div className="postventa-lista">
          {cargando ? (
            <p className="vacio-texto">Cargando comandas entregadas...</p>
          ) : pedidosFiltrados.length === 0 ? (
            <p className="vacio-texto">No hay comandas entregadas que coincidan</p>
          ) : (
            pedidosFiltrados.map((pedido) => (
              <article key={pedido.id} className="postventa-item">
                <div className="postventa-item-info">
                  <strong>{obtenerCodigoPedido(pedido)}</strong>
                  <span className="postventa-importe">{formatearMoneda(importePedido(pedido))}</span>
                  <ul>
                    {obtenerLineas(pedido).map((l, i) => (
                      <li key={l.id || i}>
                        {l.cantidad}x {l.productoNombre || `Producto #${l.productoId}`}
                        {l.talla ? ` (Talla ${l.talla})` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="postventa-item-acciones">
                  <button
                    type="button"
                    className="btn-postventa btn-postventa-devolucion"
                    onClick={() => setPedidoDevolucion(pedido)}
                  >
                    ↩️ Devolución y Reembolso
                  </button>
                  <button
                    type="button"
                    className="btn-postventa btn-postventa-cambio"
                    onClick={() => abrirCambio(pedido)}
                  >
                    🔄 Cambiar Artículo
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      {pedidoDevolucion && (
        <div className="modal-overlay postventa-overlay-interno" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <h3>↩️ Confirmar Devolución</h3>
            <p>
              Pedido <strong>{obtenerCodigoPedido(pedidoDevolucion)}</strong>.
              <br />
              Importe a reintegrar al cliente:{' '}
              <strong className="postventa-importe">
                {formatearMoneda(importePedido(pedidoDevolucion))}
              </strong>
            </p>
            <div className="modal-acciones">
              <button
                type="button"
                className="btn-modal btn-modal-secundario"
                onClick={() => setPedidoDevolucion(null)}
                disabled={procesando}
              >
                Volver
              </button>
              <button
                type="button"
                className="btn-modal btn-modal-peligro"
                onClick={confirmarDevolucion}
                disabled={procesando}
              >
                {procesando ? 'Procesando...' : 'Confirmar reembolso'}
              </button>
            </div>
          </div>
        </div>
      )}

      {pedidoCambio && (
        <div className="modal-overlay postventa-overlay-interno" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content postventa-modal">
            <h3 className="postventa-titulo-cambio">
              🔄 Cambiar Artículo · {obtenerCodigoPedido(pedidoCambio)}
            </h3>

            {obtenerLineas(pedidoCambio).length > 1 && (
              <div className="postventa-lineas">
                <span className="postventa-label">Artículo a cambiar:</span>
                {obtenerLineas(pedidoCambio).map((l, i) => (
                  <label key={l.id || i} className="postventa-radio">
                    <input
                      type="radio"
                      name="linea-cambio"
                      checked={lineaIdx === i}
                      onChange={() => {
                        setLineaIdx(i);
                        setNuevoProducto(null);
                      }}
                    />
                    {l.cantidad}x {l.productoNombre || `Producto #${l.productoId}`} ·{' '}
                    {formatearMoneda(precioUnitarioLinea(l))}
                  </label>
                ))}
              </div>
            )}

            <p className="postventa-actual">
              Precio actual: <strong>{formatearMoneda(precioActual)}</strong> · Solo se permiten
              productos de precio igual o superior.
            </p>

            <input
              type="text"
              className="input-buscador-preparacion postventa-buscador"
              placeholder="🔍 Filtrar catálogo..."
              value={filtroCatalogo}
              onChange={(e) => setFiltroCatalogo(e.target.value)}
            />

            <div className="postventa-catalogo">
              {catalogoFiltrado.map((prod) => {
                const precio = Number(prod.precio) || 0;
                const esMismo = prod.id === lineaSeleccionada?.productoId;
                const permitido = precio >= precioActual && !esMismo;
                const seleccionado = nuevoProducto?.id === prod.id;
                return (
                  <button
                    key={prod.id}
                    type="button"
                    disabled={!permitido}
                    className={`postventa-prod ${seleccionado ? 'seleccionado' : ''}`}
                    onClick={() => setNuevoProducto(prod)}
                    title={permitido ? 'Seleccionar' : 'Precio inferior al artículo original'}
                  >
                    <span>{prod.nombre}</span>
                    <strong>{formatearMoneda(precio)}</strong>
                  </button>
                );
              })}
            </div>

            <div className="postventa-diferencia">
              {nuevoProducto ? (
                <>
                  Diferencia a abonar en caja:{' '}
                  <strong className="postventa-importe">{formatearMoneda(diferencia)}</strong>
                </>
              ) : (
                'Selecciona un producto para ver la diferencia'
              )}
            </div>

            <div className="modal-acciones">
              <button
                type="button"
                className="btn-modal btn-modal-secundario"
                onClick={cerrarCambio}
                disabled={procesando}
              >
                Volver
              </button>
              <button
                type="button"
                className="btn-modal btn-modal-exito"
                onClick={confirmarCambio}
                disabled={!nuevoProducto || procesando}
              >
                {procesando ? 'Procesando...' : 'Confirmar cambio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
