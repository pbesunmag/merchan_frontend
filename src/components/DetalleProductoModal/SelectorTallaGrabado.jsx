// Controles de personalización del artículo: variante (color/modelo/héroe) y talla.
export default function SelectorTallaGrabado({
  configVariantes,
  varianteSeleccionada,
  alSeleccionarOpcion,
  esCamiseta,
  cargandoTallas,
  tallaEfectiva,
  stockActual,
  tallasSincronizadas,
  alElegirTalla,
  alAbrirGuiaTallas,
}) {
  return (
    <>
      {configVariantes && (
        <div className="selector-variantes-bloque">
          <span className="label-variante">
            Seleccionar {configVariantes.tipo}:{" "}
            <strong className="valor-variante-activo">
              {varianteSeleccionada
                ? varianteSeleccionada.etiqueta
                : ""}
            </strong>
          </span>

          <div className="botones-variantes-grid">
            {configVariantes.opciones.map((opc) => {
              const estaSeleccionada =
                varianteSeleccionada?.id === opc.id;

              return (
                <button
                  key={opc.id}
                  type="button"
                  className={`btn-variante-chip ${estaSeleccionada ? "seleccionado" : ""}`}
                  onClick={() => alSeleccionarOpcion(opc)}
                >
                  <span>{opc.etiqueta}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {esCamiseta && (
        <div className="selector-variantes-bloque selector-tallas-bloque">
          <div className="header-selector-tallas">
            <span className="label-variante">
              Talla seleccionada:{" "}
              <strong className="valor-variante-activo">
                {cargandoTallas
                  ? "Escaneando inventario..."
                  : tallaEfectiva
                    ? `${tallaEfectiva} (${stockActual} disp.)`
                    : "Sin stock disponible"}
              </strong>
            </span>
            <button
              type="button"
              className="guia-tallas-stark"
              onClick={alAbrirGuiaTallas}
              title="Abrir guía de tallas en una pestaña nueva"
            >
              📏 Guía Stark
            </button>
          </div>

          <div className="botones-tallas-grid">
            {tallasSincronizadas.map((item) => {
              const stockTalla = item.stockEfectivo;
              const agotada = stockTalla === 0;
              const activa =
                tallaEfectiva === item.talla && !agotada;

              return (
                <button
                  key={item.talla}
                  type="button"
                  className={`btn-talla btn-talla-chip ${activa ? "activa seleccionado" : ""} ${agotada ? "agotada sin-stock" : ""}`}
                  disabled={agotada}
                  onClick={() => alElegirTalla(item.talla)}
                  title={
                    agotada
                      ? `Talla ${item.talla} agotada`
                      : `${stockTalla} unidades disponibles${item.enCesta > 0 ? ` (${item.enCesta} en cesta)` : ""}`
                  }
                >
                  {item.talla}
                  {agotada && <span className="linea-agotado"></span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
