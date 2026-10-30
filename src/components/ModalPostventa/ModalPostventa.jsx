import { useState, useEffect, useMemo, useCallback } from 'react';
import { pedidoService } from '../../services/pedidoService';
import { productService } from '../../services/productService';
import { cajaService } from '../../services/cajaService';
import { formatearMoneda, obtenerCodigoPedido } from '../../utils/formatoUtils';
import './ModalPostventa.css';

const obtenerLineas = (pedido) => pedido?.lineas || pedido?.productos || [];

// Los importes se comparan y multiplican en céntimos para evitar errores de coma flotante
const aCentimos = (importe) => Math.round((Number(importe) || 0) * 100);
const deCentimos = (centimos) => centimos / 100;

const rutaImagen = (producto) => {
  const cruda = producto?.imagenUrl || producto?.imagen_url;
  if (!cruda || cruda.trim() === '') return null;
  return cruda.startsWith('/') || cruda.startsWith('http') ? cruda : `/${cruda}`;
};

function Miniatura({ src, alt }) {
  const [fallo, setFallo] = useState(false);
  if (!src || fallo) {
    return (
      <span className="postventa-miniatura postventa-miniatura-icono" aria-hidden="true">
        🛍️
      </span>
    );
  }
  return (
    <img
      className="postventa-miniatura"
      src={src}
      alt={alt}
      onError={() => setFallo(true)}
    />
  );
}

export default function ModalPostventa({ alCerrar, alCompletar }) {
  const [pedidos, setPedidos] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [procesando, setProcesando] = useState(false);

  // Paso 1: comanda abierta y unidades a gestionar por línea ({ [lineaId]: n })
  const [pedidoActivoId, setPedidoActivoId] = useState(null);
  const [cantidades, setCantidades] = useState({});

  // Confirmación de devolución: { pedido, linea (null = comanda completa), cantidad }
  const [devolucion, setDevolucion] = useState(null);

  // Paso 2: cambio en curso: { linea, cantidad }
  const [cambio, setCambio] = useState(null);
  const [nuevoProducto, setNuevoProducto] = useState(null);
  const [nuevaTalla, setNuevaTalla] = useState('');
  const [cantidadNueva, setCantidadNueva] = useState(1);
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

  const productoCatalogo = (productoId) => catalogo.find((p) => p.id === productoId);

  // Precio unitario pagado por una línea (con respaldo al precio de catálogo)
  const precioUnitarioLinea = (linea) => {
    const directo = Number(linea.precioUnitario ?? linea.precio);
    if (directo > 0) return directo;
    const cant = Number(linea.cantidad) || 1;
    const subtotal = Number(linea.subtotal);
    if (subtotal > 0) return subtotal / cant;
    return Number(productoCatalogo(linea.productoId)?.precio) || 0;
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

  const pedidoActivo = pedidos.find((p) => p.id === pedidoActivoId) || null;

  // ---------- Paso 1: desglose de la comanda ----------

  const abrirComanda = (pedido) => {
    setError(null);
    setCantidades({});
    setPedidoActivoId(pedido.id);
  };

  const cerrarComanda = () => {
    setPedidoActivoId(null);
    setCantidades({});
    setError(null);
  };

  const cantidadSeleccionada = (linea) => {
    const max = Number(linea.cantidad) || 1;
    const valor = Number(cantidades[linea.id]) || 1;
    return Math.min(Math.max(valor, 1), max);
  };

  const cambiarCantidad = (linea, valor) => {
    const max = Number(linea.cantidad) || 1;
    const numero = Math.min(Math.max(parseInt(valor, 10) || 1, 1), max);
    setCantidades((prev) => ({ ...prev, [linea.id]: numero }));
  };

  // ---------- Devolución (total o por línea) ----------

  const confirmarDevolucion = async () => {
    if (!devolucion) return;
    const { pedido, linea, cantidad } = devolucion;
    setProcesando(true);
    setError(null);
    try {
      if (linea) {
        await cajaService.solicitarDevolucionLinea(pedido.id, {
          lineaPedidoId: linea.id,
          cantidad,
        });
        const importe = deCentimos(aCentimos(precioUnitarioLinea(linea)) * cantidad);
        alCompletar?.(
          `↩️ Devolución de ${cantidad}x ${linea.productoNombre || `Producto #${linea.productoId}`} (${obtenerCodigoPedido(pedido)}): reintegrar ${formatearMoneda(importe)}`
        );
      } else {
        await cajaService.solicitarDevolucion(pedido.id);
        alCompletar?.(
          `↩️ Devolución del pedido ${obtenerCodigoPedido(pedido)}: reintegrar ${formatearMoneda(importePedido(pedido))}`
        );
        cerrarComanda();
      }
      setDevolucion(null);
      await cargar();
    } catch (err) {
      setError(err.message);
      setDevolucion(null);
    } finally {
      setProcesando(false);
    }
  };

  // ---------- Paso 2: cambio de una línea ----------

  const abrirCambio = (linea) => {
    setError(null);
    setCambio({ linea, cantidad: cantidadSeleccionada(linea) });
    setNuevoProducto(null);
    setNuevaTalla('');
    setCantidadNueva(1);
    setFiltroCatalogo('');
  };

  const cerrarCambio = () => {
    setCambio(null);
    setNuevoProducto(null);
    setNuevaTalla('');
    setCantidadNueva(1);
  };

  const lineaCambio = cambio?.linea || null;
  const cantidadEntregada = cambio?.cantidad || 1;
  const cantidadCambio = cantidadEntregada;
  const precioAntiguo = lineaCambio ? precioUnitarioLinea(lineaCambio) : 0;

  // Determina si el producto elegido es textil (camiseta) o gestiona tallas
  const esProductoTextil = (prod) => {
    if (!prod) return false;
    const cat = String(prod.nombreCategoria || prod.categoria || '').toUpperCase();
    const nom = String(prod.nombre || '').toUpperCase();
    return (
      (prod.tallas && prod.tallas.length > 0) ||
      cat.includes('CAMISETA') ||
      nom.includes('CAMISETA')
    );
  };

  const tallasNuevo = useMemo(() => {
    if (!nuevoProducto) return [];
    if (Array.isArray(nuevoProducto.tallas) && nuevoProducto.tallas.length > 0) {
      return nuevoProducto.tallas;
    }
    if (esProductoTextil(nuevoProducto)) {
      const stockBase = Number(nuevoProducto.stock) || 0;
      return ['S', 'M', 'L', 'XL'].map((t) => ({ talla: t, stock: stockBase }));
    }
    return [];
  }, [nuevoProducto]);

  const requiereTalla = tallasNuevo.length > 0;
  const tallaElegida = tallasNuevo.find((t) => t.talla === nuevaTalla) || null;
  const productoSeleccionado = nuevoProducto;
  const stockDisponibleNuevo = requiereTalla && tallaElegida
    ? Number(tallaElegida.stock) || 0
    : Number(productoSeleccionado?.stock) || 0;

  const stockSuficiente = (stock, req = cantidadNueva) => (Number(stock) || 0) >= req;

  const mismaVariante = (producto, talla) =>
    producto.id === lineaCambio?.productoId &&
    String(talla || '').toUpperCase() === String(lineaCambio?.talla || '').toUpperCase() &&
    cantidadEntregada === cantidadNueva;

  // Cualquier producto activo del catálogo con stock disponible es seleccionable
  const productoPermitido = (prod) => {
    if (prod.activo === false) return false;
    const tieneTallas = (prod.tallas || []).length > 0 || esProductoTextil(prod);
    if (!tieneTallas && prod.stock != null && (Number(prod.stock) || 0) < 1) return false;
    return true;
  };

  const cambioValido = (() => {
    if (!nuevoProducto || !productoPermitido(nuevoProducto)) return false;
    if (requiereTalla) {
      return (
        !!tallaElegida &&
        stockSuficiente(tallaElegida.stock, cantidadNueva) &&
        !mismaVariante(nuevoProducto, tallaElegida.talla)
      );
    }
    return (
      (nuevoProducto.stock == null || stockSuficiente(nuevoProducto.stock, cantidadNueva)) &&
      !mismaVariante(nuevoProducto, null)
    );
  })();

  // Diferencia exacta en céntimos: (precioNuevo * cantidadNueva) - (precioAntiguo * cantidadEntregada)
  const totalAntiguoCent = aCentimos(precioAntiguo) * cantidadEntregada;
  const totalNuevoCent = nuevoProducto ? aCentimos(nuevoProducto.precio) * cantidadNueva : 0;
  const diferenciaTotalCent = nuevoProducto ? totalNuevoCent - totalAntiguoCent : 0;
  const diferenciaTotal = deCentimos(diferenciaTotalCent);
  const totalAntiguo = deCentimos(totalAntiguoCent);
  const totalNuevo = deCentimos(totalNuevoCent);

  const catalogoFiltrado = catalogo.filter((p) =>
    String(p.nombre || '').toLowerCase().includes(filtroCatalogo.trim().toLowerCase())
  );

  const confirmarCambio = async () => {
    if (!pedidoActivo || !lineaCambio || !cambioValido) return;
    setProcesando(true);
    setError(null);
    try {
      await cajaService.solicitarCambio(pedidoActivo.id, {
        lineaPedidoId: lineaCambio.id,
        cantidad: cantidadEntregada,
        cantidadNueva,
        nuevoProductoId: nuevoProducto.id,
        nuevaTalla: requiereTalla ? nuevaTalla : null,
      });
      alCompletar?.(
        diferenciaTotal > 0
          ? `🔄 Cambio en ${obtenerCodigoPedido(pedidoActivo)}: cobrar ${formatearMoneda(diferenciaTotal)} en caja`
          : diferenciaTotal < 0
            ? `🔄 Cambio en ${obtenerCodigoPedido(pedidoActivo)}: reembolsar ${formatearMoneda(Math.abs(diferenciaTotal))} al cliente`
            : `🔄 Cambio en ${obtenerCodigoPedido(pedidoActivo)}: sin coste adicional (0,00 €)`
      );
      cerrarCambio();
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  const bannerError = error && <div className="error-banner">{error}</div>;

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

        {!pedidoActivo && !cambio && bannerError}

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
                    className="btn-postventa btn-postventa-cambio"
                    onClick={() => abrirComanda(pedido)}
                  >
                    🔄 Gestionar Comanda / Cambiar
                  </button>
                  <button
                    type="button"
                    className="btn-postventa btn-postventa-devolucion"
                    onClick={() => setDevolucion({ pedido, linea: null, cantidad: null })}
                  >
                    ↩️ Devolución total
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      {/* PASO 1: desglose de la comanda */}
      {pedidoActivo && (
        <div className="modal-overlay postventa-overlay-interno" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content postventa-modal">
            <div className="postventa-header">
              <h3 className="postventa-titulo-cambio">
                📦 Comanda {obtenerCodigoPedido(pedidoActivo)}
                <span className="postventa-importe">{formatearMoneda(importePedido(pedidoActivo))}</span>
              </h3>
              <button type="button" className="postventa-cerrar" onClick={cerrarComanda} title="Cerrar">
                ✕
              </button>
            </div>

            {!cambio && bannerError}

            <div className="postventa-lineas-detalle">
              {obtenerLineas(pedidoActivo).map((linea) => {
                const total = Number(linea.cantidad) || 1;
                const seleccionadas = cantidadSeleccionada(linea);
                const nombre = linea.productoNombre || `Producto #${linea.productoId}`;
                const imagen = rutaImagen(linea) || rutaImagen(productoCatalogo(linea.productoId));
                return (
                  <article key={linea.id} className="postventa-linea">
                    <Miniatura src={imagen} alt={nombre} />
                    <div className="postventa-linea-info">
                      <strong>{nombre}</strong>
                      <span className="postventa-linea-detalle">
                        {linea.talla ? `Talla ${linea.talla}` : 'Sin talla'}
                        {linea.textoPersonalizado ? ` · Grabado: "${linea.textoPersonalizado}"` : ''}
                      </span>
                      <span className="postventa-linea-detalle">
                        {total} uds. · {formatearMoneda(precioUnitarioLinea(linea))}/ud.
                      </span>
                    </div>

                    <div className="postventa-linea-controles contenedor-acciones-linea acciones-postventa-articulo">
                      <div
                        className="postventa-cantidad selector-cantidad-postventa"
                        aria-label="Unidades a gestionar"
                      >
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(linea, seleccionadas - 1)}
                          disabled={seleccionadas <= 1}
                          title="Menos"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={total}
                          value={seleccionadas}
                          onChange={(e) => cambiarCantidad(linea, e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(linea, seleccionadas + 1)}
                          disabled={seleccionadas >= total}
                          title="Más"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="btn-postventa btn-postventa-devolucion btn-devolver-linea"
                        onClick={() =>
                          setDevolucion({ pedido: pedidoActivo, linea, cantidad: seleccionadas })
                        }
                        disabled={procesando}
                      >
                        ↩️ Devolver {seleccionadas} uds.
                      </button>
                      <button
                        type="button"
                        className="btn-postventa btn-postventa-cambio btn-cambiar-linea"
                        onClick={() => abrirCambio(linea)}
                        disabled={procesando}
                      >
                        🔄 Cambiar {seleccionadas} uds.
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="modal-acciones">
              <button type="button" className="btn-modal btn-modal-secundario" onClick={cerrarComanda}>
                Volver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmación de devolución */}
      {devolucion && (
        <div className="modal-overlay postventa-overlay-confirmar" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <h3>↩️ Confirmar Devolución</h3>
            <p>
              Pedido <strong>{obtenerCodigoPedido(devolucion.pedido)}</strong>.
              <br />
              {devolucion.linea ? (
                <>
                  Devolver {devolucion.cantidad}x{' '}
                  {devolucion.linea.productoNombre || `Producto #${devolucion.linea.productoId}`}
                  {devolucion.linea.talla ? ` (Talla ${devolucion.linea.talla})` : ''}.
                  <br />
                </>
              ) : null}
              Importe a reintegrar al cliente:{' '}
              <strong className="postventa-importe">
                {formatearMoneda(
                  devolucion.linea
                    ? deCentimos(
                        aCentimos(precioUnitarioLinea(devolucion.linea)) * devolucion.cantidad
                      )
                    : importePedido(devolucion.pedido)
                )}
              </strong>
            </p>
            <div className="modal-acciones">
              <button
                type="button"
                className="btn-modal btn-modal-secundario"
                onClick={() => setDevolucion(null)}
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

      {/* PASO 2: selección del nuevo producto */}
      {cambio && lineaCambio && (
        <div className="modal-overlay postventa-overlay-confirmar" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content postventa-modal">
            <h3 className="postventa-titulo-cambio">🔄 Cambiar Artículo</h3>

            <p className="postventa-cabecera-cambio">
              Cambiando: {cantidadCambio}x{' '}
              {lineaCambio.productoNombre || `Producto #${lineaCambio.productoId}`}
              {lineaCambio.talla ? ` (Talla ${lineaCambio.talla})` : ''} -{' '}
              {formatearMoneda(precioAntiguo)}/ud.
            </p>

            {bannerError}

            <p className="postventa-actual">
              Selecciona cualquier artículo disponible en stock. Se calculará automáticamente la diferencia a cobrar o reembolsar respecto a{' '}
              <strong>{formatearMoneda(precioAntiguo)}/ud.</strong>
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
                const permitido = productoPermitido(prod);
                const seleccionado = nuevoProducto?.id === prod.id;
                return (
                  <button
                    key={prod.id}
                    type="button"
                    disabled={!permitido}
                    className={`postventa-prod ${seleccionado ? 'seleccionado' : ''}`}
                    onClick={() => {
                      setNuevoProducto(prod);
                      setNuevaTalla('');
                      setCantidadNueva(1);
                    }}
                    title={permitido ? 'Seleccionar' : 'No disponible para este cambio'}
                  >
                    <span>{prod.nombre}</span>
                    <strong>{formatearMoneda(prod.precio)}</strong>
                  </button>
                );
              })}
            </div>

            {productoSeleccionado && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', margin: '0.6rem 0' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Unidades a recibir:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => setCantidadNueva(prev => Math.max(1, prev - 1))}
                    style={{ padding: '0.2rem 0.6rem', background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <span style={{ fontWeight: 'bold', minWidth: '24px', textAlign: 'center', color: '#fff' }}>
                    {cantidadNueva}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCantidadNueva(prev => Math.min(stockDisponibleNuevo || productoSeleccionado.stock || 99, prev + 1))}
                    style={{ padding: '0.2rem 0.6rem', background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  (Stock disp.: {stockDisponibleNuevo || productoSeleccionado.stock})
                </span>
              </div>
            )}

            {nuevoProducto && requiereTalla && (
              <div className="postventa-tallas">
                <span className="postventa-label">Talla de {nuevoProducto.nombre}:</span>
                <div className="postventa-tallas-lista">
                  {tallasNuevo.map((t) => {
                    const sinStock = !stockSuficiente(t.stock, cantidadNueva);
                    const igual = mismaVariante(nuevoProducto, t.talla);
                    return (
                      <button
                        key={t.talla}
                        type="button"
                        disabled={sinStock || igual}
                        className={`postventa-talla ${nuevaTalla === t.talla ? 'seleccionado' : ''}`}
                        onClick={() => {
                          setNuevaTalla(t.talla);
                          if ((Number(t.stock) || 0) > 0 && cantidadNueva > Number(t.stock)) {
                            setCantidadNueva(Number(t.stock));
                          }
                        }}
                        title={
                          igual
                            ? 'Es la misma talla y cantidad del artículo original'
                            : sinStock
                              ? `Stock insuficiente (${t.stock ?? 0} uds.)`
                              : `${t.stock} uds. disponibles`
                        }
                      >
                        {t.talla}
                        <small>{t.stock ?? 0} uds.</small>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="postventa-diferencia">
              {!nuevoProducto ? (
                'Selecciona un producto para ver la diferencia'
              ) : requiereTalla && !tallaElegida ? (
                'Selecciona una talla con stock disponible'
              ) : diferenciaTotalCent === 0 ? (
                <strong className="postventa-importe">
                  Cambio sin impacto económico en caja ({formatearMoneda(0)})
                </strong>
              ) : diferenciaTotalCent > 0 ? (
                <>
                  Diferencia a abonar en caja:{' '}
                  <strong className="postventa-importe">{formatearMoneda(diferenciaTotal)}</strong> (
                  {cantidadNueva}x {formatearMoneda(nuevoProducto.precio)} = {formatearMoneda(totalNuevo)} −{' '}
                  {cantidadEntregada}x {formatearMoneda(precioAntiguo)} = {formatearMoneda(totalAntiguo)})
                </>
              ) : (
                <>
                  Diferencia a reembolsar al cliente:{' '}
                  <strong className="postventa-importe">
                    -{formatearMoneda(Math.abs(diferenciaTotal))}
                  </strong>{' '}
                  ({cantidadNueva}x {formatearMoneda(nuevoProducto.precio)} = {formatearMoneda(totalNuevo)} −{' '}
                  {cantidadEntregada}x {formatearMoneda(precioAntiguo)} = {formatearMoneda(totalAntiguo)})
                </>
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
                disabled={!cambioValido || procesando}
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
