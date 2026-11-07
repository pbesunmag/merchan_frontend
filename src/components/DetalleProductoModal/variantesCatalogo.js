// Catálogo visual de variantes y galerías, indexado por SLUG del producto (nunca por ID de base de datos).
// Cada slug se resuelve con la propiedad `slug` del producto (si la API la envía) o con su nombre normalizado.

// Normaliza un texto a slug: sin tildes, minúsculas y separado por guiones.
export const normalizarSlug = (texto) =>
  String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Palabras que debe contener el nombre normalizado del producto para asociarlo a cada slug
// (alternativas separadas por "|"). Permite que "Camiseta Spider-Man" o "Gorra personalizable" encajen.
const REGLAS_SLUG = {
  "camiseta-miles-morales": ["camiseta", "miles"],
  "camiseta-spiderman": ["camiseta", "spiderman|spider"],
  "camiseta-america": ["camiseta", "america"],
  "camiseta-avengers": ["camiseta", "avengers|vengadores"],
  "camiseta-marvel": ["camiseta", "marvel"],
  "figura-doctor-doom": ["figura", "doom"],
  "figura-groot": ["figura", "groot"],
  "figura-guantelete-ironman": ["guantelete"],
  "figura-thanos": ["figura", "thanos"],
  "figura-thor": ["figura", "thor"],
  "gorra-personalizable": ["gorra", "personaliz"],
  "gorra-america": ["gorra", "america"],
  "gorra-marvel": ["gorra", "marvel"],
  "gorra-punisher": ["gorra", "punisher"],
  "gorra-set-gafas": ["gafas"],
  "taza-personalizable": ["taza", "personaliz"],
  "taza-vengadores": ["taza", "vengadores"],
  "taza-deadpool": ["taza", "deadpool"],
  "taza-loki": ["taza", "loki"],
  "taza-marvel-695": ["taza", "695"],
};

const cumpleReglas = (compacto, palabras) =>
  palabras.every((p) => p.split("|").some((alt) => compacto.includes(alt)));

// Devuelve el slug del catálogo asociado al producto recibido por API (o null si no hay coincidencia).
export const resolverSlugProducto = (producto, catalogo) => {
  if (!producto) return null;
  const slug = normalizarSlug(producto.slug || producto.nombre);
  if (slug && catalogo[slug]) return slug;
  const compacto = slug.replace(/-/g, "");
  return (
    Object.keys(catalogo).find(
      (clave) => REGLAS_SLUG[clave] && cumpleReglas(compacto, REGLAS_SLUG[clave]),
    ) || null
  );
};

// Diccionario de variantes visuales (color / modelo / héroe) sin alteración arbitraria del precio oficial
const catalogoVariantes = {
  "camiseta-spiderman": {
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
  "gorra-personalizable": {
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
  "taza-personalizable": {
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
  "taza-vengadores": {
    tipo: "Héroe",
    opciones: [
      {
        id: "casco_ironman",
        etiqueta: "Casco Iron Man",
        imagen: "/imagenes/tazas/tazas_vengadores/taza_casco_ironman.jpg",
      },
      {
        id: "escudo_america",
        etiqueta: "Escudo Capitán",
        imagen: "/imagenes/tazas/tazas_vengadores/taza_escudo_america.jpg",
      },
      {
        id: "punyo_hulk",
        etiqueta: "Puño de Hulk",
        imagen: "/imagenes/tazas/tazas_vengadores/taza_punyo_hulk.jpg",
      },
      {
        id: "spiderman",
        etiqueta: "Spiderman 3D",
        imagen: "/imagenes/tazas/tazas_vengadores/taza_spiderman.jpg",
      },
      {
        id: "thor_martillo",
        etiqueta: "Martillo Mjolnir",
        imagen: "/imagenes/tazas/tazas_vengadores/taza_thor_martillo.jpg",
      },
    ],
  },
};

const fotosEstandar = {
  "camiseta-america": ["/imagenes/camisetas/america.jpg"],
  "camiseta-avengers": ["/imagenes/camisetas/avengers.jpg"],
  "camiseta-marvel": ["/imagenes/camisetas/marvel.jpg"],
  "camiseta-miles-morales": ["/imagenes/camisetas/miles_morales.jpg"],
  "figura-doctor-doom": [
    "/imagenes/figuras/doctor_doom/61Gy23BhwmL._AC_SL1000_.jpg",
    "/imagenes/figuras/doctor_doom/61kAKKpwpDL._AC_SL1000_.jpg",
    "/imagenes/figuras/doctor_doom/61ZKb6-jedL._AC_SL1000_.jpg",
    "/imagenes/figuras/doctor_doom/71CUw2Z4AVL._AC_SL1000_.jpg",
  ],
  "figura-groot": [
    "/imagenes/figuras/groot/primera.jpg",
    "/imagenes/figuras/groot/segunda.jpg",
    "/imagenes/figuras/groot/tercera.jpg",
  ],
  "figura-guantelete-ironman": [
    "/imagenes/figuras/guantelete_ironman/51BLOHXicCL._AC_SL1200_.jpg",
    "/imagenes/figuras/guantelete_ironman/51N4WF5GklL._AC_SL1200_.jpg",
    "/imagenes/figuras/guantelete_ironman/518SeJZNTkL._AC_SL1200_.jpg",
  ],
  "figura-thanos": [
    "/imagenes/figuras/thanos/61Y3kjH7xNL._AC_SL1500_.jpg",
    "/imagenes/figuras/thanos/714Sgxx1Y7L._AC_SL1500_.jpg",
  ],
  "figura-thor": ["/imagenes/figuras/thor/61eOx6gTxCL._AC_SL1000_.jpg"],
  "gorra-america": [
    "/imagenes/gorras/america/delante.jpg",
    "/imagenes/gorras/america/detras.jpg",
  ],
  "gorra-marvel": [
    "/imagenes/gorras/marvel/delante.jpg",
    "/imagenes/gorras/marvel/detras.jpg",
  ],
  "gorra-punisher": [
    "/imagenes/gorras/punisher/delante.jpg",
    "/imagenes/gorras/punisher/detras.jpg",
  ],
  "gorra-set-gafas": ["/imagenes/gorras/set_gorra_gafas/delante.jpg"],
  "taza-deadpool": ["/imagenes/tazas/taza_deadpool.jpg"],
  "taza-loki": ["/imagenes/tazas/taza_loki.jpg"],
  "taza-marvel-695": ["/imagenes/tazas/taza_marvel_695.jpg"],
};

export const resolverVariantes = (producto) => {
  const slug = resolverSlugProducto(producto, catalogoVariantes);
  return slug ? catalogoVariantes[slug] : null;
};

export const resolverFotos = (producto) => {
  const slug = resolverSlugProducto(producto, fotosEstandar);
  return slug ? fotosEstandar[slug] : null;
};
