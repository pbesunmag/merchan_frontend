import Miniatura from './Miniatura';
import { formatearMoneda, obtenerCodigoPedido } from '../../utils/formatoUtils';
import { obtenerLineas, rutaImagen } from './postventaUtils';

// Paso 1 de postventa: desglose de la comanda con controles de cantidad, devolución y cambio por línea.
export default function DesgloseComanda({
  pedido,
  importe,
  bannerError,
  hayCambioAbierto,
  procesando,
  productoCatalogo,
  precioUnitarioLinea,
  cantidadSeleccionada,
  cambiarCantidad,
  alDevolverLinea,
  alCambiarLinea,
  alCerrar,
}) {
  return (
    <div className="modal-overlay postventa-overlay-interno" onClick={(e) => e.stopPropagation()}>
      <div className="modal-content postventa-modal">
        <div className="postventa-header">
          <h3 className="postventa-titulo-cambio">
            📦 Comanda {obtenerCodigoPedido(pedido)}
            <span className="postventa-importe">{formatearMoneda(importe)}</span>
          </h3>
          <button type="button" className="postventa-cerrar" onClick={alCerrar} title="Cerrar">
            ✕
          </button>
        </div>

        {!hayCambioAbierto && bannerError}

        <div className="postventa-lineas-detalle">
          {obtenerLineas(pedido).map((linea) => {
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
                    onClick={() => alDevolverLinea(linea, seleccionadas)}
                    disabled={procesando}
                  >
                    ↩️ Devolver {seleccionadas} uds.
                  </button>
                  <button
                    type="button"
                    className="btn-postventa btn-postventa-cambio btn-cambiar-linea"
                    onClick={() => alCambiarLinea(linea)}
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
          <button type="button" className="btn-modal btn-modal-secundario" onClick={alCerrar}>
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}
