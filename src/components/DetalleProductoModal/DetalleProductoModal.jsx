import { useState, useEffect, useMemo } from "react";
import "./DetalleProductoModal.css";

// Diccionario de variantes con soporte de precios específicos
const catalogoVariantes = {
  1: {
    tipo: "Color",
    opciones: [
      {
        id: "roja",
        etiqueta: "Rojo Carmesí",
        imagen: "/imagenes/camisetas/spiderman/roja.jpg",
      },
      {
        id: "azul",
        etiqueta: "Azul Oscuro",
        imagen: "/imagenes/camisetas/spiderman/azul.jpg",
      },
    ],
  },
  13: {
    tipo: "Color",
    opciones: [
      {
        id: "negra",
        etiqueta: "Negra Clásica",
        imagen: "/imagenes/gorras/personalizable/negra.jpg",
      },
      {
        id: "azul",
        etiqueta: "Azul Marino",
        imagen: "/imagenes/gorras/personalizable/azul.jpg",
      },
      {
        id: "naranja",
        etiqueta: "Naranja Flash",
        imagen: "/imagenes/gorras/personalizable/naranja.jpg",
      },
      {
        id: "roja",
        etiqueta: "Roja Escarlata",
        imagen: "/imagenes/gorras/personalizable/roja.jpg",
      },
      {
        id: "negra_amarilla",
        etiqueta: "Negro / Amarillo",
        imagen: "/imagenes/gorras/personalizable/negra_amarilla.jpg",
      },
      {
        id: "negra_verde",
        etiqueta: "Negro / Verde",
        imagen: "/imagenes/gorras/personalizable/negra_verde.jpg",
      },
    ],
  },
  16: {
    tipo: "Modelo",
    opciones: [
      {
        id: "ironman",
        etiqueta: "Iron Man",
        imagen: "/imagenes/tazas/taza_personalizable/ironman.jpg",
      },
      {
        id: "america",
        etiqueta: "Capitán América",
        imagen: "/imagenes/tazas/taza_personalizable/america.jpg",
      },
      {
        id: "spiderman",
        etiqueta: "Spiderman",
        imagen: "/imagenes/tazas/taza_personalizable/spiderman.jpg",
      },
      {
        id: "thor",
        etiqueta: "Thor",
        imagen: "/imagenes/tazas/taza_personalizable/thor.jpg",
      },
      {
        id: "lobezno",
        etiqueta: "Lobezno",
        imagen: "/imagenes/tazas/taza_personalizable/lobezno.jpg",
      },
    ],
  },
  17: {
    tipo: "Héroe",
    opciones: [
      {
        id: "casco_ironman",
        etiqueta: "Casco Iron Man",
        imagen: "/imagenes/tazas/tazas_vengadores/taza_casco_ironman.jpg",
        precio: 13.5,
      },
      {
        id: "escudo_america",
        etiqueta: "Escudo Capitán",
        imagen: "/imagenes/tazas/tazas_vengadores/taza_escudo_america.jpg",
        precio: 13.5,
      },
      {
        id: "punyo_hulk",
        etiqueta: "Puño de Hulk",
        imagen: "/imagenes/tazas/tazas_vengadores/taza_punyo_hulk.jpg",
        precio: 14.5,
      },
      {
        id: "spiderman",
        etiqueta: "Spiderman 3D",
        imagen: "/imagenes/tazas/tazas_vengadores/taza_spiderman.jpg",
        precio: 15.0,
      },
      {
        id: "thor_martillo",
        etiqueta: "Martillo Mjolnir",
        imagen: "/imagenes/tazas/tazas_vengadores/taza_thor_martillo.jpg",
        precio: 15.5,
      },
    ],
  },
};

const ORDEN_TALLAS = ["XS", "S", "M", "L", "XL", "XXL"];

const fotosEstandar = {
  2: ["/imagenes/camisetas/america.jpg"],
  3: ["/imagenes/camisetas/avengers.jpg"],
  4: ["/imagenes/camisetas/marvel.jpg"],
  5: ["/imagenes/camisetas/miles_morales.jpg"],
  6: [
    "/imagenes/figuras/doctor_doom/61Gy23BhwmL._AC_SL1000_.jpg",
    "/imagenes/figuras/doctor_doom/61kAKKpwpDL._AC_SL1000_.jpg",
    "/imagenes/figuras/doctor_doom/61ZKb6-jedL._AC_SL1000_.jpg",
    "/imagenes/figuras/doctor_doom/71CUw2Z4AVL._AC_SL1000_.jpg",
  ],
  7: [
    "/imagenes/figuras/groot/primera.jpg",
    "/imagenes/figuras/groot/segunda.jpg",
    "/imagenes/figuras/groot/tercera.jpg",
  ],
  8: [
    "/imagenes/figuras/guantelete_ironman/51BLOHXicCL._AC_SL1200_.jpg",
    "/imagenes/figuras/guantelete_ironman/51N4WF5GklL._AC_SL1200_.jpg",
    "/imagenes/figuras/guantelete_ironman/518SeJZNTkL._AC_SL1200_.jpg",
  ],
  9: [
    "/imagenes/figuras/thanos/61Y3kjH7xNL._AC_SL1500_.jpg",
    "/imagenes/figuras/thanos/714Sgxx1Y7L._AC_SL1500_.jpg",
  ],
  10: ["/imagenes/figuras/thor/61eOx6gTxCL._AC_SL1000_.jpg"],
  11: [
    "/imagenes/gorras/america/delante.jpg",
    "/imagenes/gorras/america/detras.jpg",
  ],
  12: [
    "/imagenes/gorras/marvel/delante.jpg",
    "/imagenes/gorras/marvel/detras.jpg",
  ],
  14: [
    "/imagenes/gorras/punisher/delante.jpg",
    "/imagenes/gorras/punisher/detras.jpg",
  ],
  15: ["/imagenes/gorras/set_gorra_gafas/delante.jpg"],
  18: ["/imagenes/tazas/taza_deadpool.jpg"],
  19: ["/imagenes/tazas/taza_loki.jpg"],
  20: ["/imagenes/tazas/taza_marvel_695.jpg"],
};

const formatearPersonaje = (texto) => {
  if (!texto) return "Vengadores";
  return texto
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function DetalleProductoModal({
  producto,
  carrito = [],
  alCerrar,
  alAgregar,
}) {
  const esCamiseta = Boolean(
    producto &&
      (producto.id <= 5 ||
        (producto.nombreCategoria || "").toLowerCase().includes("camiseta") ||
        (producto.nombre || "").toLowerCase().includes("camiseta")),
  );

  const configVariantes = producto ? catalogoVariantes[producto.id] : null;

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

    fetch(`http://localhost:8080/api/productos/${producto.id}/tallas`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener tallas");
        return res.json();
      })
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

  // Selección declarativa de la talla sin provocar cascading renders ni useEffect
  const primeraConStock = tallasSincronizadas.find((t) => t.stockEfectivo > 0)?.talla || null;
  const tallaValida = tallasSincronizadas.some(
    (t) => t.talla === tallaSeleccionada && t.stockEfectivo > 0
  );
  const tallaEfectiva = tallaValida ? tallaSeleccionada : primeraConStock;

  if (!producto) return null;

  // Unidades totales de este producto ya en el carrito (para productos sin talla)
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

  // Configuración del Badge dinámico de disponibilidad sincronizado
  const obtenerInfoBadgeStock = (stock) => {
    if (stock > 2) {
      return {
        clase: "badge-stock-alto",
        icono: "✓",
        texto: `EN STOCK (${stock} ud)`,
      };
    }
    if (stock >= 1 && stock <= 2) {
      return {
        clase: "badge-stock-bajo",
        icono: "⚠️",
        texto: `¡Solo quedan ${stock} ud!`,
      };
    }
    return {
      clase: "badge-stock-agotado",
      icono: "🚫",
      texto: "AGOTADO EN ALMACÉN",
    };
  };

  const badgeStock = obtenerInfoBadgeStock(stockActual);

  const precioBase = Number(producto.precio) || 0;
  const precioActivo = Number(varianteSeleccionada?.precio ?? precioBase);

  const nombreProd = (producto.nombre || "").trim();
  const esGroot = nombreProd === "Figura Groot Guardianes";
  const esThor = nombreProd === "Figura Thor Dios del Trueno";
  const tieneDescuento = esGroot || esThor;

  let precioFinal = precioActivo;
  if (esGroot) precioFinal = precioActivo * 0.75;
  if (esThor) precioFinal = precioActivo * 0.9;

  const fotos = configVariantes
    ? configVariantes.opciones.map((o) => o.imagen)
    : fotosEstandar[producto.id] || [
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
    if (stockActual === 0) return;

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
      precio: precioFinal,
      subtotal: precioFinal,
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
              <div
                className="visor-principal"
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
                        onClick={() => seleccionarOpcion(opc)}
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
                        onClick={() => seleccionarFotoManual(img)}
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

            {/* COLUMNA DERECHA: INFORMACIÓN DEL PRODUCTO */}
            <div className="info-producto-detalle">
              <div>
                <div className="cabecera-badges-stark">
                  <span className="categoria-badge">
                    {producto.nombreCategoria || "EQUIPAMIENTO"}
                  </span>
                </div>
                <h2>{producto.nombre}</h2>
                <p className="descripcion-detalle">{producto.descripcion}</p>
              </div>

              {/* VARIANTES (COLOR / MODELO / HÉROE) */}
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
                      const sobrecoste =
                        opc.precio && opc.precio !== precioBase
                          ? opc.precio - precioBase
                          : 0;

                      return (
                        <button
                          key={opc.id}
                          type="button"
                          className={`btn-variante-chip ${estaSeleccionada ? "seleccionado" : ""}`}
                          onClick={() => seleccionarOpcion(opc)}
                        >
                          <span>{opc.etiqueta}</span>
                          {sobrecoste > 0 && (
                            <span className="chip-sobrecoste">
                              +{sobrecoste.toFixed(2)}€
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TALLAS SI ES CAMISETA */}
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
                    <span className="guia-tallas-stark">📏 Guía Stark</span>
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
                          onClick={() => setTallaSeleccionada(item.talla)}
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

              {/* FOOTER PRECIO DINÁMICO Y BOTÓN AÑADIR */}
              <div className="footer-compra-detalle">
                <div className="precio-detalle-bloque">
                  {tieneDescuento ? (
                    <div className="contenedor-precio-oferta-modal">
                      <div className="fila-precios-modal">
                        <span className="precio-original-tachado">
                          {precioActivo.toFixed(2)}&nbsp;€
                        </span>
                        <span className="precio-destacado-oferta">
                          {precioFinal.toFixed(2)}&nbsp;€
                        </span>
                      </div>
                      <span className="badge-descuento-modal">
                        {esGroot ? "-25% DTO" : "-10% DTO"}
                      </span>
                    </div>
                  ) : (
                    <div className="precio-detalle">
                      {precioActivo.toFixed(2)}&nbsp;€
                    </div>
                  )}
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
        <div
          className="lightbox-overlay"
          onClick={() => setPantallaCompleta(false)}
        >
          <button
            type="button"
            className="lightbox-btn-cerrar"
            onClick={() => setPantallaCompleta(false)}
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
      )}
    </>
  );
}