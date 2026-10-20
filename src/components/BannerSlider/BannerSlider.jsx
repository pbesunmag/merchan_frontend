import { useState, useEffect, useRef } from 'react';
import './BannerSlider.css';

const SLIDES = [
  {
    id: 1,
    tag: 'OFERTA LIMITADA',
    titulo: 'DESCUENTOS EN FIGURAS',
    subtitulo: 'Consigue en nuestra selección de figuras hasta un 25% de rebaja en suministros Stark.',
    textoBoton: 'VER FIGURAS',
    categoriaFiltro: 'figuras',
    badge: '-25% DTO',
    imagenFondo: '/imagenes/figuras/doctor_doom/61Gy23BhwmL._AC_SL1000_.jpg',
    colorAcento: '#dc2626'
  },
  {
    id: 2,
    tag: 'EQUIPAMIENTO TÁCTICO',
    titulo: 'CAMISETAS & GORRAS MARVEL',
    subtitulo: 'Tejido elástico de alto rendimiento y parches oficiales de Marvel.',
    textoBoton: 'EXPLORAR TEXTIL',
    categoriaFiltro: 'camisetas',
    badge: 'NUEVA REMESA',
    imagenFondo: '/imagenes/camisetas/spiderman/roja.jpg',
    colorAcento: '#00e5ff'
  },
  {
    id: 3,
    tag: 'GRABADO LÁSER',
    titulo: 'REGALOS FÁCILES & TAZAS 3D',
    subtitulo: 'Personaliza tu taza o gorra con tu nombre en código GRATIS (Apertura especial).',
    textoBoton: 'VER TAZAS Y REGALOS',
    categoriaFiltro: ['tazas', 'gorras'],
    badge: 'GRABADO GRATIS',
    imagenFondo: '/imagenes/tazas/tazas_vengadores/taza_casco_ironman.jpg',
    colorAcento: '#fbbf24'
  }
];

export default function HeroBannerSlider({ alFiltrarCategoria }) {
  const [slideActual, setSlideActual] = useState(0);
  const [estaPausado, setEstaPausado] = useState(false);
  const timerRef = useRef(null);

  const totalSlides = SLIDES.length;

  // Auto-avance cada 5.5 s; se pausa si el puntero está dentro del slider
  useEffect(() => {
    if (!estaPausado) {
      timerRef.current = setInterval(() => {
        setSlideActual((prev) => (prev + 1) % totalSlides);
      }, 5500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [estaPausado, totalSlides]);

  const irASiguiente = () => {
    setSlideActual((prev) => (prev + 1) % totalSlides);
  };

  const irAAnterior = () => {
    setSlideActual((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const slide = SLIDES[slideActual];

  return (
    <div
      className="hero-slider-contenedor"
      onMouseEnter={() => setEstaPausado(true)}
      onMouseLeave={() => setEstaPausado(false)}
    >
      {/* Fondos en capas superpuestas con transición suave */}
      {SLIDES.map((item, index) => (
        <div
          key={item.id}
          className={`hero-slide-bg ${index === slideActual ? 'activo' : ''}`}
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(7, 10, 18, 0.94) 0%, rgba(10, 15, 26, 0.8) 50%, rgba(7, 10, 18, 0.88) 100%), url(${item.imagenFondo})`
          }}
        />
      ))}

      {/* Flechas de navegación */}
      <button
        className="slider-flecha flecha-izq"
        onClick={irAAnterior}
        aria-label="Diapositiva anterior"
      >
        ❮
      </button>

      <button
        className="slider-flecha flecha-der"
        onClick={irASiguiente}
        aria-label="Siguiente diapositiva"
      >
        ❯
      </button>

      {/* Contenido central del banner */}
      <div className="hero-slider-contenido">
        <div className="hero-badge-tag" style={{ borderColor: slide.colorAcento, color: slide.colorAcento }}>
          <span className="dot-radar" style={{ backgroundColor: slide.colorAcento }}></span>
          {slide.tag}
          <span className="badge-promo-flotante">{slide.badge}</span>
        </div>

        <h1 className="hero-titulo">{slide.titulo}</h1>
        <p className="hero-subtitulo">{slide.subtitulo}</p>

        <div className="hero-acciones">
          <button
            className="btn-hero-cta"
            onClick={() => {
              if (alFiltrarCategoria) {
                alFiltrarCategoria(slide.categoriaFiltro);
              }
              const catalogo = document.querySelector('.catalogo-section');
              if (catalogo) {
                catalogo.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            {slide.textoBoton} ➔
          </button>
        </div>
      </div>

      {/* Indicadores inferiores */}
      <div className="slider-indicadores">
        {SLIDES.map((item, index) => (
          <button
            key={item.id}
            className={`slider-dot ${index === slideActual ? 'activo' : ''}`}
            onClick={() => setSlideActual(index)}
            aria-label={`Ir a diapositiva ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}