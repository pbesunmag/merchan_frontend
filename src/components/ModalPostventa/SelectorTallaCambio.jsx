// Selector de talla del artículo de sustitución (según stock disponible descontando la cesta).
export default function SelectorTallaCambio({
  nuevoProducto,
  tallasNuevo,
  nuevaTalla,
  cantidadNueva,
  unidadesEnCesta,
  stockSuficiente,
  mismaVariante,
  alElegirTalla,
}) {
  return (
      <div className="postventa-tallas">
        <span className="postventa-label">Talla de {nuevoProducto.nombre}:</span>
        <div className="postventa-tallas-lista">
          {tallasNuevo.map((t) => {
            const dispTalla = Math.max(0, (Number(t.stock) || 0) - unidadesEnCesta(nuevoProducto.id, t.talla));
            const sinStock = !stockSuficiente(dispTalla, cantidadNueva);
            const igual = mismaVariante(nuevoProducto, t.talla);
            return (
              <button
                key={t.talla}
                type="button"
                disabled={sinStock || igual}
                className={`postventa-talla ${nuevaTalla === t.talla ? 'seleccionado' : ''}`}
                onClick={() => alElegirTalla(t.talla, dispTalla)}
                title={
                  igual
                    ? 'Es la misma talla y cantidad del artículo original'
                    : sinStock
                      ? `Stock insuficiente (${dispTalla} uds.)`
                      : `${dispTalla} uds. disponibles`
                }
              >
                {t.talla}
                <small>{dispTalla} uds.</small>
              </button>
            );
          })}
        </div>
      </div>
  );
}
