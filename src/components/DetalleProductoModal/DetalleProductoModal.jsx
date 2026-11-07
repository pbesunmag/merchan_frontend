import { useState, useEffect, useMemo } from "react";
import "./DetalleProductoModal.css";
import { productService } from "../../services/productService";
import { formatearMoneda, formatearPersonaje } from "../../utils/formatoUtils";
import { esCamiseta as esProductoCamiseta } from "../../utils/categoriaUtils";
import GaleriaImagenes, { LightboxImagen } from "./GaleriaImagenes";
import SelectorTallaGrabado from "./SelectorTallaGrabado";
import { resolverVariantes, resolverFotos } from "./variantesCatalogo";

const ORDEN_TALLAS = ["XS", "S", "M", "L", "XL", "XXL"];

const URL_GUIA_TALLAS = "/imagenes/camisetas/tallas.jpg";

const abrirGuiaTallas = (e) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  window.open(URL_GUIA_TALLAS, "_blank", "noopener,noreferrer");
};

export default function DetalleProductoModal({
  producto,
  carrito = [],
  alCerrar,
  alAgregar,
}) {
  // Detección de categoría exclusivamente por los campos formales del DTO (nombreCategoria / categoria / tallas)
  const esCamiseta = Boolean(producto && esProductoCamiseta(producto));

  const configVariantes = producto ? resolverVariantes(producto) : null;

  const [opcionElegida, setOpcionElegida] = useState(null);
  const varianteSeleccionada =
    opcionElegida || configVariantes?.opciones[0] || null;

  const [tallasDisponibles, setTallasDisponibles] = useState([]);
  const [tallaSeleccionada, setTallaSeleccionada] = useState(null);
  const [imagenManual, setImagenManual] = useState(null);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  const [imagenRota, setImagenRota] = useState(false);

  const cargandoTallas = esCamiseta && tallasDisponibles.length === 0;

  useEffect(() => {
    if (!producto?.id || !esCamiseta) {
      return;
    }

    let cancelado = false;

    productService
      .obtenerTallas(producto.id)
      .then((data) => {
        if (cancelado) return;
        const listaAPI = Array.isArray(data) ? data : [];

        let tallasNormalizadas;
        if (listaAPI.length > 0) {
          tallasNormalizadas = ORDEN_TALLAS.map((codigoTalla) => {
            const encontrada = listaAPI.find(
              (item) => (item.talla || "").toUpperCase() === codigoTalla,
            );
            return encontrada
              ? {
                  ...encontrada,
                  talla: codigoTalla,
                  stock: Number(encontrada.stock) || 0,
                }
              : { talla: codigoTalla, stock: 0, disponible: false };
          });
        } else {
          const stockGeneral = Number(producto?.stock) || 0;
          tallasNormalizadas = ORDEN_TALLAS.map((codigoTalla) => ({
            talla: codigoTalla,
            stock: stockGeneral,
            disponible: stockGeneral > 0,
          }));
        }

        setTallasDisponibles(tallasNormalizadas);
      })
      .catch(() => {
        if (cancelado) return;
        const stockGeneral = Number(producto?.stock) || 0;
        const respaldo = ORDEN_TALLAS.map((codigoTalla) => ({
          talla: codigoTalla,
          stock: stockGeneral,
          disponible: stockGeneral > 0,
        }));
        setTallasDisponibles(respaldo);
      });

    return () => {
      cancelado = true;
    };
  }, [producto?.id, esCamiseta, producto?.stock, producto?.tallas]);

  // Sincronización de stock por talla restando lo que ya está en el carrito
  const tallasSincronizadas = useMemo(() => {
    if (!producto || !esCamiseta) return [];
    return tallasDisponibles.map((item) => {
      const enCestaTalla = carrito
        .filter((c) => c.id === producto.id && c.talla === item.talla)
        .reduce((acc, c) => acc + (Number(c.cantidad) || 0), 0);

      const stockBaseTalla = Number(item.stock) || 0;
      const stockEfectivoTalla = Math.max(0, stockBaseTalla - enCestaTalla);

      return {
        ...item,
        stockBase: stockBaseTalla,
        stockEfectivo: stockEfectivoTalla,
        enCesta: enCestaTalla,
      };
    });
  }, [tallasDisponibles, carrito, producto, esCamiseta]);

  const primeraConStock =
    tallasSincronizadas.find((t) => t.stockEfectivo > 0)?.talla || null;
  const tallaValida = tallasSincronizadas.some(
    (t) => t.talla === tallaSeleccionada && t.stockEfectivo > 0,
  );
  const tallaEfectiva = tallaValida ? tallaSeleccionada : primeraConStock;

  if (!producto) return null;

  const unidadesProductoEnCesta = carrito
    .filter((c) => c.id === producto.id)
    .reduce((acc, c) => acc + (Number(c.cantidad) || 0), 0);

  const objetoTallaActiva = esCamiseta
    ? tallasSincronizadas.find((t) => t.talla === tallaEfectiva)
    : null;

  const stockBaseModal = esCamiseta
    ? objetoTallaActiva
      ? Number(objetoTallaActiva.stockBase) || 0
      : 0
    : Number(
        producto.stockMax ??
          producto.stock ??
          (producto.activo === false ? 0 : 10),
      );

  const stockActual = esCamiseta
    ? objetoTallaActiva
      ? Number(objetoTallaActiva.stockEfectivo) || 0
      : 0
    : Math.max(0, stockBaseModal - unidadesProductoEnCesta);

  const obtenerInfoBadgeStock = (stock) => {
    if (stock > 3) {
      return {
        clase: "badge-stock-alto",
        icono: "✓",
        texto: `EN STOCK (${stock} ud)`,
      };
    }
    if (stock === 2 || stock === 3) {
      return {
        clase: "badge-stock-bajo",
        icono: "⚠️",
        texto: `¡Solo quedan ${stock} ud!`,
      };
    }
    if (stock === 1) {
      return {
        clase: "badge-stock-bajo",
        icono: "⚠️",
        texto: "¡Solo queda 1 ud!",
      };
    }
    return {
      clase: "badge-stock-agotado",
      icono: "🚫",
      texto: "AGOTADO EN ALMACÉN",
    };
  };

  const badgeStock = obtenerInfoBadgeStock(stockActual);

  // Precio estricto del catálogo (producto.precio)
  const precioOficial = Number(producto.precio) || 0;

  const fotos = configVariantes
    ? configVariantes.opciones.map((o) => o.imagen)
    : resolverFotos(producto) || [
        producto.imagenUrl || producto.imagen_url || "",
      ];

  const imagenActiva =
    imagenManual ||
    (varianteSeleccionada
      ? varianteSeleccionada.imagen
      : fotos[0] || producto.imagenUrl || "");

  const seleccionarOpcion = (opcion) => {
    setOpcionElegida(opcion);
    setImagenManual(opcion.imagen);
    setImagenRota(false);
  };

  const seleccionarFotoManual = (img) => {
    setImagenManual(img);
    setImagenRota(false);
  };

  const manejarAgregar = () => {
    if (stockActual === 0 || producto.activo === false) return;

    let nombreFinal = producto.nombre;
    const detallesExtras = [];

    if (varianteSeleccionada) {
      detallesExtras.push(varianteSeleccionada.etiqueta);
    }
    if (esCamiseta && tallaEfectiva) {
      detallesExtras.push(`Talla ${tallaEfectiva}`);
    }

    if (detallesExtras.length > 0) {
      nombreFinal = `${producto.nombre} (${detallesExtras.join(" - ")})`;
    }

    const productoParaCarrito = {
      ...producto,
      precio: precioOficial,
      subtotal: precioOficial,
      nombre: nombreFinal,
      variante: varianteSeleccionada ? varianteSeleccionada.etiqueta : null,
      talla: esCamiseta ? tallaEfectiva : null,
      stockMax: stockBaseModal,
      imagenUrl: varianteSeleccionada
        ? varianteSeleccionada.imagen
        : producto.imagenUrl || fotos[0],
    };

    alAgregar(productoParaCarrito);
    alCerrar();
  };

  return (
    <>
      <div className="modal-overlay" onClick={() => alCerrar()}>
        <div
          className="modal-contenedor-amazon modal-producto-container modal-detalle-contenido modal-hud-card"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="btn-cerrar-modal"
            onClick={() => alCerrar()}
            title="Cerrar ventana"
          >
            ✕
          </button>

          <div className="modal-grid-detalle">
            {/* COLUMNA IZQUIERDA: GALERÍA VERTICAL */}
            <div className="galeria-amazon modal-col-imagen">
              <GaleriaImagenes
                producto={producto}
                imagenActiva={imagenActiva}
                imagenRota={imagenRota}
                setImagenRota={setImagenRota}
                setPantallaCompleta={setPantallaCompleta}
                configVariantes={configVariantes}
                fotos={fotos}
                alSeleccionarOpcion={seleccionarOpcion}
                alSeleccionarFoto={seleccionarFotoManual}
              />
            </div>


            {/* COLUMNA DERECHA: INFORMACIÓN DEL PRODUCTO */}
            <div className="info-producto-detalle">
              <div>
                <div className="cabecera-badges-stark">
                  <span className="categoria-badge">
                    {producto.nombreCategoria || producto.categoria || "EQUIPAMIENTO"}
                  </span>
                </div>
                <h2>{producto.nombre}</h2>
                <p className="descripcion-detalle">{producto.descripcion}</p>
              </div>

              <SelectorTallaGrabado
                configVariantes={configVariantes}
                varianteSeleccionada={varianteSeleccionada}
                alSeleccionarOpcion={seleccionarOpcion}
                esCamiseta={esCamiseta}
                cargandoTallas={cargandoTallas}
                tallaEfectiva={tallaEfectiva}
                stockActual={stockActual}
                tallasSincronizadas={tallasSincronizadas}
                alElegirTalla={setTallaSeleccionada}
                alAbrirGuiaTallas={abrirGuiaTallas}
              />


              {/* ESPECIFICACIONES */}
              <div className="especificaciones-stark modal-specs-grid">
                <p className="modal-spec-col">
                  <strong>Personaje</strong>
                  <span>{formatearPersonaje(producto.personaje)}</span>
                </p>
                <div className="modal-spec-col">
                  <span className="spec-label">ESTADO</span>
                  <div className="spec-valor tienda-estado">
                    {stockActual > 0 ? (
                      "Disponible"
                    ) : (
                      <span
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          lineHeight: "1.2",
                        }}
                      >
                        <span>Disponible en</span>
                        <span style={{ whiteSpace: "nowrap" }}>
                          7 - 10 días
                        </span>
                      </span>
                    )}
                  </div>
                </div>
                <p className="modal-spec-col">
                  <strong>Stock</strong>
                  <span
                    className={`badge-stock-inline badge-disponibilidad ${badgeStock.clase}`}
                  >
                    <span>{badgeStock.icono}</span>
                    <span>{badgeStock.texto}</span>
                  </span>
                </p>
              </div>

              {/* FOOTER PRECIO OFICIAL Y BOTÓN AÑADIR */}
              <div className="footer-compra-detalle">
                <div className="precio-detalle-bloque">
                  <div className="precio-detalle">
                    {formatearMoneda(precioOficial)}
                  </div>
                </div>

                <button
                  type="button"
                  className={`btn-agregar-detalle ${stockActual === 0 ? "btn-agotado-detalle" : ""}`}
                  onClick={() => manejarAgregar()}
                  disabled={stockActual === 0}
                >
                  {stockActual === 0
                    ? "🚫 ARTÍCULO AGOTADO"
                    : "+ Añadir a la Cesta"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LIGHTBOX DE PANTALLA COMPLETA */}
      {pantallaCompleta && !imagenRota && (
        <LightboxImagen
          producto={producto}
          imagenActiva={imagenActiva}
          varianteSeleccionada={varianteSeleccionada}
          alCerrar={() => setPantallaCompleta(false)}
        />
      )}
    </>
  );
}