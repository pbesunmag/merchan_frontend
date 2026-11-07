import { useState, useEffect, useMemo, useCallback } from 'react';
import { pedidoService } from '../../services/pedidoService';
import { productService } from '../../services/productService';
import { cajaService } from '../../services/cajaService';
import { formatearMoneda, obtenerCodigoPedido } from '../../utils/formatoUtils';
import DesgloseComanda from './DesgloseComanda';
import CestaCambio from './CestaCambio';
import ResumenContableCambio from './ResumenContableCambio';
import SelectorTallaCambio from './SelectorTallaCambio';
import ConfirmarDevolucion from './ConfirmarDevolucion';
import { obtenerLineas, aCentimos, deCentimos } from './postventaUtils';
import './ModalPostventa.css';

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
  const [cestaCambio, setCestaCambio] = useState([]);
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
    setCestaCambio([]);
    setFiltroCatalogo('');
  };

  const cerrarCambio = () => {
    setCambio(null);
    setNuevoProducto(null);
    setNuevaTalla('');
    setCantidadNueva(1);
    setCestaCambio([]);
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

  // Unidades ya añadidas en la cesta de cambio para un producto y talla
  const unidadesEnCesta = (prodId, talla = null) =>
    cestaCambio
      .filter(
        (item) =>
          item.productoId === prodId &&
          String(item.talla || '').toUpperCase() === String(talla || '').toUpperCase()
      )
      .reduce((acc, item) => acc + (Number(item.cantidad) || 0), 0);

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
  const stockBaseSeleccion = requiereTalla && tallaElegida
    ? Number(tallaElegida.stock) || 0
    : Number(productoSeleccionado?.stock) || 0;
  const enCestaSeleccion = productoSeleccionado
    ? unidadesEnCesta(productoSeleccionado.id, requiereTalla ? nuevaTalla : null)
    : 0;
  const stockDisponibleNuevo = Math.max(0, stockBaseSeleccion - enCestaSeleccion);

  const stockSuficiente = (stock, req = cantidadNueva) => (Number(stock) || 0) >= req;

  const mismaVariante = (producto, talla) =>
    cestaCambio.length === 0 &&
    producto.id === lineaCambio?.productoId &&
    String(talla || '').toUpperCase() === String(lineaCambio?.talla || '').toUpperCase() &&
    cantidadEntregada === cantidadNueva;

  // Cualquier producto activo del catálogo con stock disponible es seleccionable
  const productoPermitido = (prod) => {
    if (prod.activo === false) return false;
    const tieneTallas = (prod.tallas || []).length > 0 || esProductoTextil(prod);
    if (!tieneTallas && prod.stock != null && (Number(prod.stock) || 0) - unidadesEnCesta(prod.id, null) < 1) {
      return false;
    }
    return true;
  };

  const seleccionActualValida = (() => {
    if (!nuevoProducto || !productoPermitido(nuevoProducto)) return false;
    if (requiereTalla) {
      const dispTalla = (Number(tallaElegida?.stock) || 0) - unidadesEnCesta(nuevoProducto.id, tallaElegida?.talla);
      return (
        !!tallaElegida &&
        dispTalla >= cantidadNueva &&
        !mismaVariante(nuevoProducto, tallaElegida.talla)
      );
    }
    const dispProd = (Number(nuevoProducto.stock) || 0) - unidadesEnCesta(nuevoProducto.id, null);
    return (
      (nuevoProducto.stock == null || dispProd >= cantidadNueva) &&
      !mismaVariante(nuevoProducto, null)
    );
  })();

  const agregarACestaCambio = () => {
    if (!seleccionActualValida || !nuevoProducto) return;
    const tallaFinal = requiereTalla ? nuevaTalla : null;
    setCestaCambio((prev) => {
      const idx = prev.findIndex(
        (item) =>
          item.productoId === nuevoProducto.id &&
          String(item.talla || '').toUpperCase() === String(tallaFinal || '').toUpperCase()
      );
      if (idx >= 0) {
        const copia = [...prev];
        copia[idx] = {
          ...copia[idx],
          cantidad: copia[idx].cantidad + cantidadNueva,
        };
        return copia;
      }
      return [
        ...prev,
        {
          productoId: nuevoProducto.id,
          nombre: nuevoProducto.nombre,
          precio: Number(nuevoProducto.precio) || 0,
          cantidad: cantidadNueva,
          talla: tallaFinal,
        },
      ];
    });
    setNuevoProducto(null);
    setNuevaTalla('');
    setCantidadNueva(1);
  };

  const quitarDeCestaCambio = (index) => {
    setCestaCambio((prev) => prev.filter((_, i) => i !== index));
  };

  // Lista efectiva de artículos para el cambio: la cesta + (si hay uno válido seleccionado sin pulsar "Añadir")
  const articulosEfectivosCambio = useMemo(() => {
    const lista = [...cestaCambio];
    if (seleccionActualValida && nuevoProducto) {
      const tallaFinal = requiereTalla ? nuevaTalla : null;
      const idx = lista.findIndex(
        (item) =>
          item.productoId === nuevoProducto.id &&
          String(item.talla || '').toUpperCase() === String(tallaFinal || '').toUpperCase()
      );
      if (idx >= 0) {
        lista[idx] = { ...lista[idx], cantidad: lista[idx].cantidad + cantidadNueva };
      } else {
        lista.push({
          productoId: nuevoProducto.id,
          nombre: nuevoProducto.nombre,
          precio: Number(nuevoProducto.precio) || 0,
          cantidad: cantidadNueva,
          talla: tallaFinal,
        });
      }
    }
    return lista;
  }, [cestaCambio, seleccionActualValida, nuevoProducto, requiereTalla, nuevaTalla, cantidadNueva]);

  const cambioValido = articulosEfectivosCambio.length > 0;

  // Diferencia exacta en céntimos: suma(cesta) - (precioAntiguo * cantidadEntregada)
  const totalAntiguoCent = aCentimos(precioAntiguo) * cantidadEntregada;
  const totalNuevoCent = articulosEfectivosCambio.reduce(
    (acc, item) => acc + aCentimos(item.precio) * item.cantidad,
    0
  );
  const diferenciaTotalCent = cambioValido ? totalNuevoCent - totalAntiguoCent : 0;
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
      const nuevosArticulos = articulosEfectivosCambio.map((item) => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
        talla: item.talla || null,
      }));
      const primerItem = nuevosArticulos[0];
      await cajaService.solicitarCambio(pedidoActivo.id, {
        lineaPedidoId: lineaCambio.id,
        cantidad: cantidadEntregada,
        cantidadEntregada,
        cantidadNueva: primerItem?.cantidad ?? 1,
        nuevoProductoId: primerItem?.productoId ?? null,
        nuevaTalla: primerItem?.talla ?? null,
        nuevosArticulos,
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
        <DesgloseComanda
          pedido={pedidoActivo}
          importe={importePedido(pedidoActivo)}
          bannerError={bannerError}
          hayCambioAbierto={!!cambio}
          procesando={procesando}
          productoCatalogo={productoCatalogo}
          precioUnitarioLinea={precioUnitarioLinea}
          cantidadSeleccionada={cantidadSeleccionada}
          cambiarCantidad={cambiarCantidad}
          alDevolverLinea={(linea, cantidad) =>
            setDevolucion({ pedido: pedidoActivo, linea, cantidad })
          }
          alCambiarLinea={abrirCambio}
          alCerrar={cerrarComanda}
        />
      )}

      {/* Confirmación de devolución */}
      {devolucion && (
        <ConfirmarDevolucion
          devolucion={devolucion}
          importe={
            devolucion.linea
              ? deCentimos(aCentimos(precioUnitarioLinea(devolucion.linea)) * devolucion.cantidad)
              : importePedido(devolucion.pedido)
          }
          procesando={procesando}
          alVolver={() => setDevolucion(null)}
          alConfirmar={confirmarDevolucion}
        />
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
              <SelectorTallaCambio
                nuevoProducto={nuevoProducto}
                tallasNuevo={tallasNuevo}
                nuevaTalla={nuevaTalla}
                cantidadNueva={cantidadNueva}
                unidadesEnCesta={unidadesEnCesta}
                stockSuficiente={stockSuficiente}
                mismaVariante={mismaVariante}
                alElegirTalla={(talla, dispTalla) => {
                  setNuevaTalla(talla);
                  if (dispTalla > 0 && cantidadNueva > dispTalla) {
                    setCantidadNueva(dispTalla);
                  }
                }}
              />
            )}

            {productoSeleccionado && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.6rem' }}>
                <button
                  type="button"
                  className="btn-postventa btn-postventa-cambio"
                  disabled={!seleccionActualValida}
                  onClick={agregarACestaCambio}
                >
                  ➕ Añadir a la cesta de cambio
                </button>
              </div>
            )}

            <CestaCambio cestaCambio={cestaCambio} alQuitar={quitarDeCestaCambio} />

            <ResumenContableCambio
              cambioValido={cambioValido}
              nuevoProducto={nuevoProducto}
              requiereTalla={requiereTalla}
              tallaElegida={tallaElegida}
              diferenciaTotalCent={diferenciaTotalCent}
              diferenciaTotal={diferenciaTotal}
              totalNuevo={totalNuevo}
              totalAntiguo={totalAntiguo}
            />


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