import { useState } from 'react';
import './DetalleProductoModal.css';

// Diccionario de variantes principales (color/modelo/héroe)
const catalogoVariantes = {
  1: {
    tipo: 'Color',
    opciones: [
      { id: 'roja', etiqueta: 'Rojo Carmesí', imagen: '/imagenes/camisetas/spiderman/roja.jpg' },
      { id: 'azul', etiqueta: 'Azul Oscuro', imagen: '/imagenes/camisetas/spiderman/azul.jpg' }
    ]
  },
  13: {
    tipo: 'Color',
    opciones: [
      { id: 'negra', etiqueta: 'Negra Clásica', imagen: '/imagenes/gorras/personalizable/negra.jpg' },
      { id: 'azul', etiqueta: 'Azul Marino', imagen: '/imagenes/gorras/personalizable/azul.jpg' },
      { id: 'naranja', etiqueta: 'Naranja Flash', imagen: '/imagenes/gorras/personalizable/naranja.jpg' },
      { id: 'roja', etiqueta: 'Roja Escarlata', imagen: '/imagenes/gorras/personalizable/roja.jpg' },
      { id: 'negra_amarilla', etiqueta: 'Negro / Amarillo', imagen: '/imagenes/gorras/personalizable/negra_amarilla.jpg' },
      { id: 'negra_verde', etiqueta: 'Negro / Verde', imagen: '/imagenes/gorras/personalizable/negra_verde.jpg' }
    ]
  },
  16: {
    tipo: 'Modelo',
    opciones: [
      { id: 'ironman', etiqueta: 'Iron Man', imagen: '/imagenes/tazas/taza_personalizable/ironman.jpg' },
      { id: 'america', etiqueta: 'Capitán América', imagen: '/imagenes/tazas/taza_personalizable/america.jpg' },
      { id: 'spiderman', etiqueta: 'Spiderman', imagen: '/imagenes/tazas/taza_personalizable/spiderman.jpg' },
      { id: 'thor', etiqueta: 'Thor', imagen: '/imagenes/tazas/taza_personalizable/thor.jpg' },
      { id: 'lobezno', etiqueta: 'Lobezno', imagen: '/imagenes/tazas/taza_personalizable/lobezno.jpg' }
    ]
  },
  17: {
    tipo: 'Héroe',
    opciones: [
      { id: 'casco_ironman', etiqueta: 'Casco Iron Man', imagen: '/imagenes/tazas/tazas_vengadores/taza_casco_ironman.jpg' },
      { id: 'escudo_america', etiqueta: 'Escudo Capitán', imagen: '/imagenes/tazas/tazas_vengadores/taza_escudo_america.jpg' },
      { id: 'punyo_hulk', etiqueta: 'Puño de Hulk', imagen: '/imagenes/tazas/tazas_vengadores/taza_punyo_hulk.jpg' },
      { id: 'spiderman', etiqueta: 'Spiderman 3D', imagen: '/imagenes/tazas/tazas_vengadores/taza_spiderman.jpg' },
      { id: 'thor_martillo', etiqueta: 'Martillo Mjolnir', imagen: '/imagenes/tazas/tazas_vengadores/taza_thor_martillo.jpg' }
    ]
  }
};

const TALLAS_DISPONIBLES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const stockTallasPorProducto = {
  1: { XS: true, S: true, M: true, L: true, XL: false, XXL: false },
  2: { XS: false, S: true, M: true, L: true, XL: true, XXL: false },
  3: { XS: true, S: false, M: true, L: true, XL: false, XXL: true },
  4: { XS: false, S: false, M: true, L: true, XL: true, XXL: true },
  5: { XS: true, S: true, M: false, L: true, XL: true, XXL: false }
};

const fotosEstandar = {
  2: ['/imagenes/camisetas/america.jpg'],
  3: ['/imagenes/camisetas/avengers.jpg'],
  4: ['/imagenes/camisetas/marvel.jpg'],
  5: ['/imagenes/camisetas/miles_morales.jpg'],
  6: [
    '/imagenes/figuras/doctor_doom/61Gy23BhwmL._AC_SL1000_.jpg',
    '/imagenes/figuras/doctor_doom/61kAKKpwpDL._AC_SL1000_.jpg',
    '/imagenes/figuras/doctor_doom/61ZKb6-jedL._AC_SL1000_.jpg',
    '/imagenes/figuras/doctor_doom/71CUw2Z4AVL._AC_SL1000_.jpg'
  ],
  7: [
    '/imagenes/figuras/groot/primera.jpg',
    '/imagenes/figuras/groot/segunda.jpg',
    '/imagenes/figuras/groot/tercera.jpg'
  ],
  8: [
    '/imagenes/figuras/guantelete_ironman/51BLOHXicCL._AC_SL1200_.jpg',
    '/imagenes/figuras/guantelete_ironman/51N4WF5GklL._AC_SL1200_.jpg',
    '/imagenes/figuras/guantelete_ironman/518SeJZNTkL._AC_SL1200_.jpg'
  ],
  9: [
    '/imagenes/figuras/thanos/61Y3kjH7xNL._AC_SL1500_.jpg',
    '/imagenes/figuras/thanos/714Sgxx1Y7L._AC_SL1500_.jpg'
  ],
  10: ['/imagenes/figuras/thor/61eOx6gTxCL._AC_SL1000_.jpg'],
  11: ['/imagenes/gorras/america/delante.jpg', '/imagenes/gorras/america/detras.jpg'],
  12: ['/imagenes/gorras/marvel/delante.jpg', '/imagenes/gorras/marvel/detras.jpg'],
  14: ['/imagenes/gorras/punisher/delante.jpg', '/imagenes/gorras/punisher/detras.jpg'],
  15: ['/imagenes/gorras/set_gorra_gafas/delante.jpg'],
  18: ['/imagenes/tazas/taza_deadpool.jpg'],
  19: ['/imagenes/tazas/taza_loki.jpg'],
  20: ['/imagenes/tazas/taza_marvel_695.jpg']
};

export default function DetalleProductoModal({ producto, alCerrar, alAgregar }) {
  const [varianteSeleccionada, setVarianteSeleccionada] = useState(null);
  const [tallaSeleccionada, setTallaSeleccionada] = useState(null);
  const [imagenManual, setImagenManual] = useState(null);
  const [productoAnteriorId, setProductoAnteriorId] = useState(producto?.id);

  // Estado para la ampliación a pantalla completa
  const [pantallaCompleta, setPantallaCompleta] = useState(false);

  const esCamiseta =
    producto &&
    (producto.id <= 5 ||
      (producto.nombreCategoria || '').toLowerCase().includes('camiseta') ||
      (producto.nombre || '').toLowerCase().includes('camiseta'));

  if (producto?.id !== productoAnteriorId) {
    setProductoAnteriorId(producto?.id);
    const config = catalogoVariantes[producto?.id];
    setVarianteSeleccionada(config ? config.opciones[0] : null);

    if (esCamiseta) {
      const stock = stockTallasPorProducto[producto?.id] || {};
      const primeraDisponible = TALLAS_DISPONIBLES.find((t) => stock[t] !== false) || 'M';
      setTallaSeleccionada(primeraDisponible);
    } else {
      setTallaSeleccionada(null);
    }

    setImagenManual(null);
    setPantallaCompleta(false);
  }

  if (!producto) return null;

  const configVariantes = catalogoVariantes[producto.id];
  const stockTallas = stockTallasPorProducto[producto.id] || {};

  const fotos = configVariantes
    ? configVariantes.opciones.map((o) => o.imagen)
    : (fotosEstandar[producto.id] || [producto.imagenUrl || '/imagenes/camisetas/avengers.jpg']);

  const imagenActiva =
    imagenManual ||
    (varianteSeleccionada ? varianteSeleccionada.imagen : fotos[0]);

  const seleccionarOpcion = (opcion) => {
    setVarianteSeleccionada(opcion);
    setImagenManual(opcion.imagen);
  };

  const manejarAgregar = () => {
    let nombreFinal = producto.nombre;
    const detallesExtras = [];

    if (varianteSeleccionada) {
      detallesExtras.push(varianteSeleccionada.etiqueta);
    }
    if (esCamiseta && tallaSeleccionada) {
      detallesExtras.push(`Talla ${tallaSeleccionada}`);
    }

    if (detallesExtras.length > 0) {
      nombreFinal = `${producto.nombre} (${detallesExtras.join(' - ')})`;
    }

    const productoParaCarrito = {
      ...producto,
      nombre: nombreFinal,
      variante: varianteSeleccionada ? varianteSeleccionada.etiqueta : null,
      talla: esCamiseta ? tallaSeleccionada : null,
      imagenUrl: varianteSeleccionada ? varianteSeleccionada.imagen : (producto.imagenUrl || fotos[0])
    };

    alAgregar(productoParaCarrito);
    alCerrar();
  };

  return (
    <>
      <div className="modal-overlay" onClick={alCerrar}>
        <div className="modal-contenedor-amazon" onClick={(e) => e.stopPropagation()}>
          <button className="btn-cerrar-modal" onClick={alCerrar} title="Cerrar ventana">
            ✕
          </button>

          <div className="modal-grid-detalle">
            {/* COLUMNA IZQUIERDA: GALERÍA DE IMÁGENES */}
            <div className="galeria-amazon">
              <div className="miniaturas-columna">
                {configVariantes
                  ? configVariantes.opciones.map((opc, idx) => (
                      <button
                        key={idx}
                        className={`miniatura-btn ${imagenActiva === opc.imagen ? 'activa' : ''}`}
                        onClick={() => seleccionarOpcion(opc)}
                        title={opc.etiqueta}
                      >
                        <img src={opc.imagen} alt={opc.etiqueta} />
                      </button>
                    ))
                  : fotos.map((img, idx) => (
                      <button
                        key={idx}
                        className={`miniatura-btn ${imagenActiva === img ? 'activa' : ''}`}
                        onClick={() => setImagenManual(img)}
                      >
                        <img src={img} alt={`${producto.nombre} ${idx + 1}`} />
                      </button>
                    ))}
              </div>

              {/* VISOR PRINCIPAL GRANDE CON CLICK PARA AMPLIAR */}
              <div
                className="visor-principal"
                onClick={() => setPantallaCompleta(true)}
                title="Haz clic para ver en pantalla completa"
              >
                <img
                  src={imagenActiva}
                  alt={producto.nombre}
                  className="imagen-destacada"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/imagenes/camisetas/avengers.jpg';
                  }}
                />
                <span className="indicador-click-zoom">
                  <span className="icono-zoom">⛶</span> Clic para ampliar a pantalla completa
                </span>
              </div>
            </div>

            {/* COLUMNA DERECHA: INFORMACIÓN DEL ARTÍCULO */}
            <div className="info-producto-detalle">
              <div>
                <span className="categoria-badge">{producto.nombreCategoria || 'EQUIPAMIENTO'}</span>
                <h2>{producto.nombre}</h2>
                <p className="descripcion-detalle">{producto.descripcion}</p>
              </div>

              {/* SELECTOR DE COLORES / MODELO */}
              {configVariantes && (
                <div className="selector-variantes-bloque">
                  <span className="label-variante">
                    Seleccionar {configVariantes.tipo}:{' '}
                    <strong className="valor-variante-activo">
                      {varianteSeleccionada ? varianteSeleccionada.etiqueta : ''}
                    </strong>
                  </span>

                  <div className="botones-variantes-grid">
                    {configVariantes.opciones.map((opc) => {
                      const estaSeleccionada = varianteSeleccionada?.id === opc.id;
                      return (
                        <button
                          key={opc.id}
                          type="button"
                          className={`btn-variante-chip ${estaSeleccionada ? 'seleccionado' : ''}`}
                          onClick={() => seleccionarOpcion(opc)}
                        >
                          {opc.etiqueta}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SELECTOR DE TALLAS PARA CAMISETAS */}
              {esCamiseta && (
                <div className="selector-variantes-bloque selector-tallas-bloque">
                  <div className="header-selector-tallas">
                    <span className="label-variante">
                      Talla seleccionada:{' '}
                      <strong className="valor-variante-activo">{tallaSeleccionada || 'Elige una talla'}</strong>
                    </span>
                    <span className="guia-tallas-stark">📏 Guía Stark</span>
                  </div>

                  <div className="botones-tallas-grid">
                    {TALLAS_DISPONIBLES.map((talla) => {
                      const disponible = stockTallas[talla] !== false;
                      const seleccionada = tallaSeleccionada === talla;

                      return (
                        <button
                          key={talla}
                          type="button"
                          disabled={!disponible}
                          className={`btn-talla-chip ${seleccionada ? 'seleccionado' : ''} ${!disponible ? 'sin-stock' : ''}`}
                          onClick={() => setTallaSeleccionada(talla)}
                          title={disponible ? `Talla ${talla} disponible` : `Talla ${talla} agotada temporalmente`}
                        >
                          {talla}
                          {!disponible && <span className="linea-agotado"></span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ESPECIFICACIONES EN FILA */}
              <div className="especificaciones-stark">
                <p><strong>Personaje</strong> {producto.personaje || 'Vengadores'}</p>
                <p><strong>Personalizable</strong> {producto.personalizable}</p>
                <p><strong>Disponibilidad</strong> {producto.activo ? 'En existencias' : 'Agotado'}</p>
              </div>

              {/* FOOTER CON PRECIO Y BOTÓN */}
              <div className="footer-compra-detalle">
                <div className="precio-detalle">
                  {(Number(producto.precio) || 0).toFixed(2)} €
                </div>
                <button className="btn-agregar-detalle" onClick={manejarAgregar}>
                  + Añadir a la Cesta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PANTALLA COMPLETA (LIGHTBOX) */}
      {pantallaCompleta && (
        <div className="lightbox-overlay" onClick={() => setPantallaCompleta(false)}>
          <button
            className="lightbox-btn-cerrar"
            onClick={() => setPantallaCompleta(false)}
            title="Cerrar pantalla completa (Esc)"
          >
            ✕
          </button>
          <div className="lightbox-contenedor" onClick={(e) => e.stopPropagation()}>
            <img
              src={imagenActiva}
              alt={`${producto.nombre} pantalla completa`}
              className="lightbox-imagen"
            />
            <div className="lightbox-pie">
              <span>{producto.nombre}</span>
              {varianteSeleccionada && <span className="lightbox-variante">◈ {varianteSeleccionada.etiqueta}</span>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}