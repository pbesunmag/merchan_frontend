import { formatearMoneda } from "../../../utils/formatoUtils";
import { esCamiseta } from "../../../utils/categoriaUtils";
import { aplicarPorcentaje } from "../../../services/promocionService";

// Rejilla de tarjetas del catálogo con su botón de "ver más/reducir".
export default function CatalogoGrid({
  productosVisibles,
  productosFiltrados,
  carrito,
  productoMasVendido,
  mostrarTodos,
  limiteInicial,
  alSeleccionar,
  alAgregar: agregarAlCarrito,
  alAlternarMostrarTodos,
}) {
  return (
    <>
      <div className="productos-grid">
        {productosVisibles.map((prod) => {
          const rutaCruda = prod.imagenUrl || prod.imagen_url;
          const rutaFoto =
            rutaCruda && rutaCruda.trim() !== ""
              ? rutaCruda.startsWith("/")
                ? rutaCruda
                : `/${rutaCruda}`
              : "/imagenes/camisetas/avengers.jpg";

          // Descuento directo ÚNICAMENTE para productos marcados individualmente con descuento fijo (Groot y Thor)
          const tieneDescuentoFijo = Boolean(
            prod?.tieneDescuentoFijo && Number(prod?.porcentajeDescuento) > 0
          );
          const porcentajeDescuento = tieneDescuentoFijo
            ? Number(prod.porcentajeDescuento)
            : 0;
          const precioBase = Number(prod?.precioOriginal ?? prod?.precio) || 0;
          const precioFinal = tieneDescuentoFijo
            ? aplicarPorcentaje(precioBase, porcentajeDescuento)
            : precioBase;

          const esCamisetaCatalogo = esCamiseta(prod);

          const unidadesEnCesta = carrito
            .filter((item) => item.id === prod.id)
            .reduce((total, item) => total + (Number(item.cantidad) || 0), 0);

          const stockBaseProd = Number(
            prod.stockMax ?? prod.stock ?? (prod.activo === false ? 0 : 10),
          );
          const stockEfectivo = Math.max(0, stockBaseProd - unidadesEnCesta);

          const estaAgotado = stockEfectivo === 0;
          const pocoStock = stockEfectivo > 0 && stockEfectivo <= 3;

          return (
            <article key={prod.id} className="producto-card">
              {productoMasVendido &&
                productoMasVendido.productoId === prod.id && (
                  <span
                    className="badge-top-ventas"
                    title={`Producto estrella: ${productoMasVendido.totalUnidadesVendidas} unidades vendidas`}
                  >
                    ⭐ TOP VENTAS
                  </span>
                )}
              <div
                className="producto-img-container"
                onClick={() => alSeleccionar(prod)}
                title="Haz clic para ver la galería completa"
              >
                {tieneDescuentoFijo && (
                  <span className="badge-descuento-card">
                    -{porcentajeDescuento}% OFF
                  </span>
                )}
                <img
                  src={rutaFoto}
                  alt={prod.nombre}
                  className="producto-img"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/imagenes/camisetas/avengers.jpg";
                  }}
                />
              </div>

              <div>
                <h3>{prod.nombre}</h3>
                <p>{prod.descripcion}</p>
              </div>

              <div>
                <div className="producto-precio producto-precios-contenedor">
                  {tieneDescuentoFijo ? (
                    <>
                      <div className="producto-precio-promo-fila">
                        <span className="producto-precio-tachado">
                          {formatearMoneda(precioBase)}
                        </span>
                        <span className="chip-descuento-precio">
                          -{porcentajeDescuento}% OFF
                        </span>
                      </div>
                      <span className="producto-precio-actual">
                        {formatearMoneda(precioFinal)}
                      </span>
                    </>
                  ) : (
                    <span className="producto-precio-actual">
                      {formatearMoneda(precioBase)}
                    </span>
                  )}
                </div>

                <div
                  className={`producto-stock-estado ${
                    estaAgotado
                      ? "stock-agotado"
                      : pocoStock
                        ? "stock-bajo"
                        : "stock-disponible"
                  }`}
                >
                  {estaAgotado ? (
                    <>
                      <span>🚫 Agotado</span>
                      <span className="producto-stock-unidades">
                        en almacén
                      </span>
                    </>
                  ) : pocoStock ? (
                    <>
                      <span>⚠️¡Últimas unidades!</span>
                      <span className="producto-stock-unidades">
                        {stockEfectivo === 1
                          ? "(Solo queda 1 ud)"
                          : `(Solo quedan ${stockEfectivo} ud)`}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>✓ En stock</span>
                      <span className="producto-stock-unidades">
                        ({stockEfectivo}&nbsp;disponibles)
                      </span>
                    </>
                  )}
                </div>

                <button
                  className={`btn-agregar ${
                    !esCamisetaCatalogo && estaAgotado
                      ? "btn-agregar-agotado"
                      : ""
                  }`}
                  disabled={!esCamisetaCatalogo && estaAgotado}
                  onClick={() => {
                    if (esCamisetaCatalogo) {
                      alSeleccionar(prod);
                    } else {
                      agregarAlCarrito({
                        ...prod,
                        precioOriginal: precioBase,
                        precio: precioFinal,
                        porcentajeCatalogo: porcentajeDescuento,
                        esDescuentoFijo: tieneDescuentoFijo,
                        stockMax: stockBaseProd,
                      });
                    }
                  }}
                >
                  {esCamisetaCatalogo
                    ? "Elegir Talla"
                    : estaAgotado
                      ? "🚫 Agotado"
                      : "Añadir a la Cesta"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {productosFiltrados.length > limiteInicial && (
        <div className="ver-mas-container">
          <button
            className="btn-ver-todo-stark"
            onClick={() => alAlternarMostrarTodos()}
          >
            {mostrarTodos ? (
              <>▲ Reducir Catálogo</>
            ) : (
              <>
                ▼ Desplegar Catálogo Completo (
                {productosFiltrados.length - limiteInicial} restantes)
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
}
