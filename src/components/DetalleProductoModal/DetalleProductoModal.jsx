import { useState } from 'react';
import './DetalleProductoModal.css';

// Diccionario de variantes con soporte de precios específicos
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
      { id: 'casco_ironman', etiqueta: 'Casco Iron Man', imagen: '/imagenes/tazas/tazas_vengadores/taza_casco_ironman.jpg', precio: 13.50 },
      { id: 'escudo_america', etiqueta: 'Escudo Capitán', imagen: '/imagenes/tazas/tazas_vengadores/taza_escudo_america.jpg', precio: 13.50 },
      { id: 'punyo_hulk', etiqueta: 'Puño de Hulk', imagen: '/imagenes/tazas/tazas_vengadores/taza_punyo_hulk.jpg', precio: 14.50 },
      { id: 'spiderman', etiqueta: 'Spiderman 3D', imagen: '/imagenes/tazas/tazas_vengadores/taza_spiderman.jpg', precio: 15.00 },
      { id: 'thor_martillo', etiqueta: 'Martillo Mjolnir', imagen: '/imagenes/tazas/tazas_vengadores/taza_thor_martillo.jpg', precio: 15.50 }
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
    '/imagenes/figuras/groot/71g61VxIEvL._AC_SL1500_.jpg',
    '/imagenes/figuras/groot/512HG9k5WeL._AC_SL1500_.jpg'
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

// 1. FUNCIÓN QUE LIMPIA LAS BARRAS BAJAS Y CAPITALIZA: 'DOCTOR_DOOM' -> 'Doctor Doom'
const formatearPersonaje = (texto) => {
  if (!texto) return 'Vengadores';
  return texto
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function DetalleProductoModal({ producto, alCerrar, alAgregar }) {
  const [varianteSeleccionada, setVarianteSeleccionada] = useState(null);
  const [tallaSeleccionada, setTallaSeleccionada] = useState(null);
  const [imagenManual, setImagenManual] = useState(null);
  const [productoAnteriorId, setProductoAnteriorId] = useState(producto?.id);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  const [imagenRota, setImagenRota] = useState(false);

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
    setImagenRota(false);
  }

  if (!producto) return null;

  const configVariantes = catalogoVariantes[producto.id];
  const stockTallas = stockTallasPorProducto[producto.id] || {};

  // 2. CÁLCULO DE PRECIO REACTIVO SEGÚN VARIANTE
  const precioBase = Number(producto.precio) || 0;
  const precioActivo = Number(varianteSeleccionada?.precio ?? precioBase);

  const fotos = configVariantes
    ? configVariantes.opciones.map((o) => o.imagen)
    : (fotosEstandar[producto.id] || [producto.imagenUrl || producto.imagen_url || '']);

  const imagenActiva =
    imagenManual ||
    (varianteSeleccionada ? varianteSeleccionada.imagen : (fotos[0] || producto.imagenUrl || ''));

  const seleccionarOpcion = (opcion) => {
    setVarianteSeleccionada(opcion);
    setImagenManual(opcion.imagen);
    setImagenRota(false);
  };

  const seleccionarFotoManual = (img) => {
    setImagenManual(img);
    setImagenRota(false);
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
      precio: precioActivo,
      subtotal: precioActivo,
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
            {/* COLUMNA IZQUIERDA: GALERÍA VERTICAL (FOTO ARRIBA, MINIATURAS EN FILA HORIZONTAL ABAJO) */}
            <div className="galeria-amazon">
              {/* 1. VISOR PRINCIPAL ARRIBA */}
              <div
                className="visor-principal"
                onClick={() => !imagenRota && setPantallaCompleta(true)}
                title={imagenRota ? 'Imagen no disponible' : 'Haz clic para ver en pantalla completa'}
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

              {/* 2. TEXTO ENLACE EN EL MEDIO */}
              {!imagenRota && (
                <button
                  type="button"
                  className="btn-ver-vista-completa"
                  onClick={() => setPantallaCompleta(true)}
                >
                  Haz clic para ver la vista completa
                </button>
              )}

              {/* 3. FILA HORIZONTAL DE MINIATURAS ABAJO */}
              <div className="miniaturas-fila">
                {configVariantes
                  ? configVariantes.opciones.map((opc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`miniatura-btn ${imagenActiva === opc.imagen ? 'activa' : ''}`}
                        onClick={() => seleccionarOpcion(opc)}
                        title={opc.etiqueta}
                      >
                        <img
                          src={opc.imagen}
                          alt={opc.etiqueta}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </button>
                    ))
                  : fotos.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`miniatura-btn ${imagenActiva === img ? 'activa' : ''}`}
                        onClick={() => seleccionarFotoManual(img)}
                      >
                        <img
                          src={img}
                          alt={`${producto.nombre} ${idx + 1}`}
                          onError={(e) => {
                            e.currentTarget.parentElement.style.opacity = '0.35';
                          }}
                        />
                      </button>
                    ))}
              </div>
            </div>

            {/* COLUMNA DERECHA: INFORMACIÓN DEL PRODUCTO */}
            <div className="info-producto-detalle">
              <div>
                <span className="categoria-badge">{producto.nombreCategoria || 'EQUIPAMIENTO'}</span>
                <h2>{producto.nombre}</h2>
                <p className="descripcion-detalle">{producto.descripcion}</p>
              </div>

              {/* VARIANTES (COLOR / MODELO / HÉROE) */}
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
                      const sobrecoste = opc.precio && opc.precio !== precioBase ? opc.precio - precioBase : 0;

                      return (
                        <button
                          key={opc.id}
                          type="button"
                          className={`btn-variante-chip ${estaSeleccionada ? 'seleccionado' : ''}`}
                          onClick={() => seleccionarOpcion(opc)}
                        >
                          <span>{opc.etiqueta}</span>
                          {sobrecoste > 0 && (
                            <span className="chip-sobrecoste">+{sobrecoste.toFixed(2)}€</span>
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
                        >
                          {talla}
                          {!disponible && <span className="linea-agotado"></span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ESPECIFICACIONES CON EL PERSONAJE FORMATEADO Y VALIDACIÓN ESTRICTA DE PERSONALIZABLE */}
              <div className="especificaciones-stark">
                <p>
                  <strong>Personaje</strong>
                  {formatearPersonaje(producto.personaje)}
                </p>
                <p>
                  <strong>Personalizable</strong>
                  {producto.personalizable === 'Sí' || producto.personalizable === true || producto.personalizable === 1
                    ? 'Sí'
                    : 'No'}
                </p>
                <p>
                  <strong>Disponibilidad</strong>
                  {producto.activo ? 'En existencias' : 'Agotado'}
                </p>
              </div>

              {/* FOOTER PRECIO DINÁMICO Y BOTÓN AÑADIR */}
              <div className="footer-compra-detalle">
                <div className="precio-detalle">
                  {precioActivo.toFixed(2)} €
                </div>
                <button className="btn-agregar-detalle" onClick={manejarAgregar}>
                  + Añadir a la Cesta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LIGHTBOX DE PANTALLA COMPLETA */}
      {pantallaCompleta && !imagenRota && (
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