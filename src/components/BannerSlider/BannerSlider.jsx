import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './BannerSlider.css';
import funkoLogo from '../../assets/funko_logo.jpg';
import imagenSorteo from '../../assets/sorteo.jpg';

const slides = [
  {
    id: 1,
    tagline: 'EQUIPAMIENTO TÁCTICO',
    insignia: 'NUEVA REMESA',
    titulo: 'CAMISETAS & GORRAS MARVEL',
    descripcion: 'Tejido elástico de alto rendimiento y parches oficiales de Marvel.',
    textoBoton: 'EXPLORAR TEXTIL →',
    categoriaDestino: 'CAMISETAS',
    imagenFondo: '/imagenes/camisetas/spiderman/roja.jpg',
    colorAcento: '#00e5ff'
  },
  {
    id: 2,
    tagline: 'COLECCIÓN EXCLUSIVA',
    insignia: 'STARK TECH',
    titulo: 'FIGURAS ARTICULADAS',
    descripcion: 'Estatuas de colección y figuras premium de tus héroes favoritos. ¡Hasta un 25% de descuento en nuestra selección de figuras!',
    textoBoton: 'VER FIGURAS →',
    categoriaDestino: 'FIGURAS',
    imagenFondo: '/imagenes/figuras/doctor_doom/61Gy23BhwmL._AC_SL1000_.jpg',
    colorAcento: '#dc2626'
  },
  {
    id: 3,
    tagline: 'EDICIÓN PERSONALIZABLE',
    insignia: 'TALLER STARK',
    titulo: 'TAZAS & GORRAS PERSONALIZADAS',
    descripcion: 'Graba tu identificador o escudo personalizado con tecnología láser. ¡Aprovecha el descuento de Especial Apertura en la personalización!',
    textoBoton: 'VER PERSONALIZABLES →',
    categoriaDestino: 'PERSONALIZABLES',
    imagenFondo: '/imagenes/tazas/tazas_vengadores/taza_casco_ironman.jpg',
    colorAcento: '#fbbf24'
  },
  {
    id: 4,
    tagline: 'PRÓXIMO SUMINISTRO',
    insignia: 'PRÓXIMAMENTE',
    titulo: 'FUNKO POP! MARVEL',
    descripcion: 'Los héroes más poderosos de la Tierra en formato cabezón. Próximamente en stock.',
    textoBoton: 'AVÍSAME AL LLEGAR',
    logoPromocional: funkoLogo,
    imagenFondo: funkoLogo,
    colorAcento: '#00e5ff',
    esLanzamiento: true,
    accionEspecial: 'MODAL_FUNKO'
  },
  {
    id: 5,
    tagline: 'EVENTOS STARK',
    insignia: 'SORTEOS PRÓXIMAMENTE',
    titulo: 'SORTEOS Y RECOMPENSAS',
    descripcion: 'Participa en las misiones comunitarias y gana equipamiento exclusivo de Industrias Stark.',
    textoBoton: 'GANADORES DEL SORTEO',
    imagenFondo: imagenSorteo,
    colorAcento: '#00e5ff',
    accionEspecial: 'RUTA_SORTEOS'
  }
];

export default function BannerSlider({ onSeleccionarCategoria }) {
  const [slideActual, setSlideActual] = useState(0);
  const [estaPausado, setEstaPausado] = useState(false);
  const [mostrarModalFunko, setMostrarModalFunko] = useState(false);
  const [emailFunko, setEmailFunko] = useState('');
  const [funkoSuscrito, setFunkoSuscrito] = useState(false);

  const timerRef = useRef(null);
  const navigate = useNavigate();

  const totalSlides = slides.length;

  // Auto-avance cada 5.5 s; se pausa si el puntero está dentro del slider o el modal está abierto
  useEffect(() => {
    if (!estaPausado && !mostrarModalFunko) {
      timerRef.current = setInterval(() => {
        setSlideActual((prev) => (prev + 1) % totalSlides);
      }, 5500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [estaPausado, mostrarModalFunko, totalSlides]);

  const irASiguiente = () => {
    setSlideActual((prev) => (prev + 1) % totalSlides);
  };

  const irAAnterior = () => {
    setSlideActual((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const manejarAccionSlide = (slideItem) => {
    if (slideItem.accionEspecial === 'MODAL_FUNKO') {
      setFunkoSuscrito(false);
      setEmailFunko('');
      setMostrarModalFunko(true);
      return;
    }

    if (slideItem.accionEspecial === 'RUTA_SORTEOS') {
      navigate('/sorteos');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (onSeleccionarCategoria && slideItem.categoriaDestino) {
      onSeleccionarCategoria(slideItem.categoriaDestino);
    }
    const seccionCatalogo = document.querySelector('.catalogo-section');
    if (seccionCatalogo) {
      seccionCatalogo.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const manejarEnvioFunko = (e) => {
    e.preventDefault();
    if (!emailFunko.trim()) return;
    setFunkoSuscrito(true);
  };

  const cerrarModalFunko = () => {
    setMostrarModalFunko(false);
  };

  const slide = slides[slideActual];

  return (
    <>
      <div
        className="hero-slider-contenedor seccion-proximo-suministro"
        onMouseEnter={() => setEstaPausado(true)}
        onMouseLeave={() => setEstaPausado(false)}
      >
        {/* Fondos en capas superpuestas con transición suave */}
        {slides.map((item, index) => (
          <div
            key={item.id}
            className={`hero-slide-bg ${index === slideActual ? 'activo' : ''}`}
            style={{
              backgroundImage: item.imagenFondo
                ? `linear-gradient(90deg, rgba(7, 10, 18, 0.94) 0%, rgba(10, 15, 26, 0.8) 50%, rgba(7, 10, 18, 0.88) 100%), url(${item.imagenFondo})`
                : 'radial-gradient(circle at center, #111827 0%, #060911 100%)'
            }}
          />
        ))}

        {/* Flechas de navegación */}
        <button
          type="button"
          className="slider-flecha flecha-izq"
          onClick={irAAnterior}
          aria-label="Diapositiva anterior"
        >
          ❮
        </button>

        <button
          type="button"
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
            {slide.tagline}
            <span className="badge-promo-flotante">{slide.insignia}</span>
          </div>

          {/* LOGO PROMOCIONAL FUNKO (Aparece únicamente si el slide lo define) */}
          {slide.logoPromocional && (
            <div className="hero-logo-promocional-contenedor">
              <img
                src={slide.logoPromocional}
                alt="Logo Promocional Funko Pop"
                className="hero-logo-promocional"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/funko_logo.jpg';
                }}
              />
            </div>
          )}

          <h1 className="hero-titulo">{slide.titulo}</h1>
          <p className="hero-subtitulo">{slide.descripcion}</p>

          <div className="hero-acciones">
            <button
              type="button"
              className="btn-hero-cta"
              onClick={() => manejarAccionSlide(slide)}
            >
              {slide.textoBoton}
            </button>
          </div>
        </div>

        {/* Indicadores inferiores */}
        <div className="slider-indicadores">
          {slides.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`slider-dot ${index === slideActual ? 'activo' : ''}`}
              onClick={() => setSlideActual(index)}
              aria-label={`Ir a diapositiva ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Modal HUD de suscripción Funko Pop */}
      {mostrarModalFunko && (
        <div className="funko-modal-overlay" onClick={cerrarModalFunko}>
          <div className="funko-modal-hud" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="funko-modal-cerrar"
              onClick={cerrarModalFunko}
              aria-label="Cerrar modal"
            >
              ✕
            </button>

            <h3 className="funko-modal-titulo">
              Notificación de Suministro: Funko Pop Marvel
            </h3>

            {!funkoSuscrito ? (
              <form className="funko-modal-form" onSubmit={manejarEnvioFunko}>
                <p className="funko-modal-desc">
                  Introduce tu correo electrónico para enlazar tu frecuencia con el radar de suministros Stark:
                </p>
                <input
                  type="email"
                  required
                  placeholder="agente@starkindustries.com"
                  value={emailFunko}
                  onChange={(e) => setEmailFunko(e.target.value)}
                  className="funko-modal-input"
                />
                <button type="submit" className="funko-modal-btn">
                  Notificarme al llegar
                </button>
              </form>
            ) : (
              <div className="funko-modal-exito">
                <p>
                  ✅ ¡Frecuencia enlazada! Recibirás un aviso en tu correo cuando el cargamento esté disponible
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
