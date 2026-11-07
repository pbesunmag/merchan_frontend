// Galería del producto: visor principal, miniaturas (variantes o fotos) y lightbox a pantalla completa.
export default function GaleriaImagenes({
  producto,
  imagenActiva,
  imagenRota,
  setImagenRota,
  setPantallaCompleta,
  configVariantes,
  fotos,
  alSeleccionarOpcion,
  alSeleccionarFoto,
}) {
  return (
    <div className="galeria-amazon modal-col-imagen">
      <div
        className="visor-principal modal-imagen-principal-caja"
        onClick={() => {
          if (!imagenRota) setPantallaCompleta(true);
        }}
        title={
          imagenRota
            ? "Imagen no disponible"
            : "Haz clic para ver en pantalla completa"
        }
      >
        {!imagenRota ? (
          <img
            src={imagenActiva}
            alt={producto.nombre}
            className="imagen-destacada"
            onError={() => setImagenRota(true)}
          />
        ) : (
          <div className="placeholder-sin-imagen">
            <span className="icono-sin-foto">🛡️</span>
            <p className="texto-sin-foto">Vista previa no disponible</p>
            <span className="subtexto-sin-foto">{producto.nombre}</span>
          </div>
        )}
      </div>

      {!imagenRota && (
        <button
          type="button"
          className="btn-ver-vista-completa"
          onClick={() => setPantallaCompleta(true)}
        >
          Haz clic para ver la vista completa
        </button>
      )}

      <div className="miniaturas-fila">
        {configVariantes
          ? configVariantes.opciones.map((opc, idx) => (
              <button
                key={idx}
                type="button"
                className={`miniatura-btn ${imagenActiva === opc.imagen ? "activa" : ""}`}
                onClick={() => alSeleccionarOpcion(opc)}
                title={opc.etiqueta}
              >
                <img
                  src={opc.imagen}
                  alt={opc.etiqueta}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </button>
            ))
          : fotos.map((img, idx) => (
              <button
                key={idx}
                type="button"
                className={`miniatura-btn ${imagenActiva === img ? "activa" : ""}`}
                onClick={() => alSeleccionarFoto(img)}
              >
                <img
                  src={img}
                  alt={`${producto.nombre} ${idx + 1}`}
                  onError={(e) => {
                    e.currentTarget.parentElement.style.opacity =
                      "0.35";
                  }}
                />
              </button>
            ))}
      </div>
    </div>
  );
}

export function LightboxImagen({ producto, imagenActiva, varianteSeleccionada, alCerrar }) {
  return (
    <div
      className="lightbox-overlay"
      onClick={() => alCerrar()}
    >
      <button
        type="button"
        className="lightbox-btn-cerrar"
        onClick={() => alCerrar()}
        title="Cerrar pantalla completa (Esc)"
      >
        ✕
      </button>
      <div
        className="lightbox-contenedor"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imagenActiva}
          alt={`${producto.nombre} pantalla completa`}
          className="lightbox-imagen"
        />
        <div className="lightbox-pie">
          <span>{producto.nombre}</span>
          {varianteSeleccionada && (
            <span className="lightbox-variante">
              ◈ {varianteSeleccionada.etiqueta}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
